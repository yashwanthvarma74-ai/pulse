import { ObjectId } from 'mongodb';
import type { CreateReportInput, Report, ReportReason } from '@pulse/shared';
import type { Core } from './core';
import { isDuplicateKey } from './db';
import { forbidden, notFound } from './errors';
import { hex } from './ids';
import { instruments } from './metrics';
import type { ViewerContext } from './policy';
import { getVisiblePost, toFeedItems } from './posts';
import { toUser } from './users';
import { createReportSchema } from '@pulse/shared';

// Reporting needs the right to see the post, so it cannot be used to find hidden ones.
export async function reportPost(
  core: Core,
  viewer: ViewerContext,
  postId: ObjectId,
  input: CreateReportInput,
): Promise<void> {
  const post = await getVisiblePost(core, viewer, postId);
  const { reason, details } = createReportSchema.parse(input);
  try {
    await core.database.reports.insertOne({
      _id: new ObjectId(),
      reporterId: new ObjectId(viewer.id),
      postId: post._id,
      reason,
      details,
      status: 'open',
      createdAt: new Date(),
    });
  } catch (error) {
    // reporting the same post twice is the same report
    if (!isDuplicateKey(error)) throw error;
  }
}

// The moderation worker's first pass: flag a post that contains one of the configured phrases.
export async function scanPost(core: Core, postId: ObjectId): Promise<boolean> {
  const post = await core.database.posts.findOne({ _id: postId });
  if (!post || post.status === 'removed') return false;
  const terms = core.config.MODERATION_TERMS.split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const text = post.text.toLowerCase();
  const matched = terms.find((term) => text.includes(term));
  if (!matched) return false;

  try {
    await core.database.reports.insertOne({
      _id: new ObjectId(),
      reporterId: null,
      postId,
      reason: 'spam' satisfies ReportReason,
      details: `Matched "${matched}"`,
      status: 'open',
      createdAt: new Date(),
    });
    instruments.moderationFlags.add(1);
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }
  return true;
}

export async function listOpenReports(core: Core, moderatorId: ObjectId): Promise<Report[]> {
  const moderator = await core.database.users.findOne({ _id: moderatorId });
  if (!moderator?.moderator) throw forbidden('Only moderators can see the queue.');

  const reports = await core.database.reports
    .find({ status: 'open' })
    .sort({ createdAt: 1 })
    .limit(100)
    .toArray();
  if (reports.length === 0) return [];

  const [posts, reporters] = await Promise.all([
    core.database.posts.find({ _id: { $in: reports.map((report) => report.postId) } }).toArray(),
    core.database.users
      .find({
        _id: { $in: reports.flatMap((report) => (report.reporterId ? [report.reporterId] : [])) },
      })
      .toArray(),
  ]);
  // Moderators read reported posts here directly; this is the one place that bypasses the viewer policy.
  const items = await toFeedItems(core.database, null, posts);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const reporterById = new Map(reporters.map((user) => [hex(user._id), user]));

  return reports.flatMap((report) => {
    const post = itemById.get(hex(report.postId));
    if (!post) return [];
    const reporter = report.reporterId ? reporterById.get(hex(report.reporterId)) : undefined;
    return [
      {
        id: hex(report._id),
        reason: report.reason,
        details: report.details,
        reporter: reporter ? toUser(reporter) : null,
        post,
        createdAt: report.createdAt.toISOString(),
      },
    ];
  });
}

export async function resolveReport(
  core: Core,
  moderatorId: ObjectId,
  reportId: ObjectId,
  action: 'remove' | 'dismiss',
): Promise<void> {
  const moderator = await core.database.users.findOne({ _id: moderatorId });
  if (!moderator?.moderator) throw forbidden('Only moderators can resolve reports.');
  const report = await core.database.reports.findOne({ _id: reportId });
  if (!report) throw notFound('That report');

  if (action === 'dismiss') {
    await core.database.reports.updateOne({ _id: reportId }, { $set: { status: 'dismissed' } });
    return;
  }

  const post = await core.database.posts.findOneAndUpdate(
    { _id: report.postId, status: 'visible' },
    { $set: { status: 'removed' } },
  );
  if (post?.parentId) {
    await core.database.posts.updateOne({ _id: post.parentId }, { $inc: { replyCount: -1 } });
  }
  // every open report about the same post is settled by removing it
  await core.database.reports.updateMany(
    { postId: report.postId, status: 'open' },
    { $set: { status: 'removed' } },
  );
}
