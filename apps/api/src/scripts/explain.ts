// Prints the query plan of every query the app depends on and writes them to docs/explain/queries.md,
// so the plans are committed next to the code that relies on them.
//
//   npm run explain
import { mkdir, writeFile } from 'node:fs/promises';
import { arch, platform } from 'node:os';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Document, Filter, ObjectId } from 'mongodb';
import { createCore, loadConfig, olderThan, type PostDoc } from '@pulse/core';

const config = loadConfig();
const core = await createCore(config, { indexes: false });
const { database } = core;

interface Plan {
  executionStats: Document;
  queryPlanner: { winningPlan: Document };
}

function stages(stage: Document | undefined, out: string[] = []): string[] {
  if (!stage) return out;
  out.push(stage.indexName ? `${stage.stage} (${stage.indexName})` : String(stage.stage));
  if (stage.inputStage) stages(stage.inputStage, out);
  for (const input of stage.inputStages ?? []) stages(input, out);
  return out;
}

const sections: string[] = [];
async function report(title: string, note: string, run: () => Promise<Plan>) {
  const plan = await run();
  const stats = plan.executionStats;
  sections.push(
    [
      `### ${title}`,
      '',
      note,
      '',
      `- Plan: ${stages(plan.queryPlanner.winningPlan).join(' → ')}`,
      `- Documents returned: ${stats.nReturned}`,
      `- Index keys examined: ${stats.totalKeysExamined}`,
      `- Documents examined: ${stats.totalDocsExamined}`,
      `- Execution time: ${stats.executionTimeMillis} ms`,
      '',
    ].join('\n'),
  );
}

const explain = (cursor: { explain: (v: 'executionStats') => Promise<unknown> }) =>
  cursor.explain('executionStats') as Promise<Plan>;

const general = await database.communities.findOne({ slug: 'general' });
const celebrity = await database.users.findOne({ handle: 'celebrity' });
const alice = await database.users.findOne({ handle: 'alice' });
const postTotal = await database.posts.estimatedDocumentCount();
if (!general || !celebrity || !alice) throw new Error('Run "npm run seed" first.');

const pageAfter = async (
  filter: Filter<PostDoc>,
  skip: number,
): Promise<{ createdAt: Date; id: ObjectId } | undefined> => {
  const row = await database.posts
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(1)
    .next();
  return row ? { createdAt: row.createdAt, id: row._id } : undefined;
};

const community: Filter<PostDoc> = { communityId: general._id, parentId: null, status: 'visible' };
await report(
  'Community page, first page',
  'Filter: community, not a reply, visible. Sort: newest first. Limit 41 (a page of 20, doubled, plus one).',
  () => explain(database.posts.find(community).sort({ createdAt: -1, _id: -1 }).limit(41)),
);
const deep = await pageAfter(community, 5000);
await report(
  'Community page, 5,000 posts deep',
  'The same query after a cursor. An offset would have to walk past 5,000 rows; the cursor starts at the right place.',
  () =>
    explain(
      database.posts
        .find({ ...community, ...olderThan(deep) } as Filter<PostDoc>)
        .sort({ createdAt: -1, _id: -1 })
        .limit(41),
    ),
);

const profile: Filter<PostDoc> = { authorId: celebrity._id, parentId: null, status: 'visible' };
await report(
  'Profile page',
  'One author, newest first. Also the pull for an account over the fan-out threshold.',
  () => explain(database.posts.find(profile).sort({ createdAt: -1, _id: -1 }).limit(41)),
);

const followees = (await database.follows.find({ followerId: alice._id }).toArray()).map(
  (f) => f.followeeId,
);
await report(
  'Rebuilding a timeline from MongoDB',
  `The posts of everyone Alice follows (${followees.length} accounts) and her own, newest 1,000. Used when a timeline is missing and when Redis is away.`,
  () =>
    explain(
      database.posts
        .find({
          authorId: { $in: [...followees, alice._id] },
          parentId: null,
          status: 'visible',
          visibility: { $ne: 'community' },
        })
        .sort({ createdAt: -1, _id: -1 })
        .limit(1000),
    ),
);

const parent = await database.posts.findOne({ replyCount: { $gt: 0 } });
if (parent) {
  await report('Replies under a post', 'Oldest first, with the cursor running the other way.', () =>
    explain(
      database.posts
        .find({ parentId: parent._id, status: 'visible' })
        .sort({ createdAt: 1, _id: 1 })
        .limit(41),
    ),
  );
}

await report(
  'Fan-out: all followers of one account',
  `Reads ${celebrity.followerCount} follow edges for the popular account. Accounts over the threshold are not pushed, so this is what push fan-out would cost.`,
  () =>
    explain(
      database.follows.find({ followeeId: celebrity._id }, { projection: { followerId: 1 } }),
    ),
);

await report(
  'Repair sweep',
  'Finds posts the worker has not processed. A partial index, so it is empty and instant when nothing is stuck.',
  () =>
    explain(
      database.posts
        .find({ unprocessed: true, createdAt: { $lt: new Date() } })
        .sort({ createdAt: 1 })
        .limit(200),
    ),
);

await report('Notifications list', 'One user, newest first.', () =>
  explain(
    database.notifications.find({ userId: alice._id }).sort({ createdAt: -1, _id: -1 }).limit(41),
  ),
);
await report('Unread notification count', 'Counted straight from the index.', () =>
  explain(database.notifications.find({ userId: alice._id, read: false })),
);

await report('Post search', 'Text index on the post text, best matches first.', () =>
  explain(
    database.posts
      .find({ $text: { $search: 'marathon kilometres' }, status: 'visible', parentId: null })
      .sort({ score: { $meta: 'textScore' } })
      .limit(100),
  ),
);

const version = (await database.db.admin().serverInfo()).version;
const body = [
  '# Query plans',
  '',
  'Generated by `npm run explain`. Every field a query filters or sorts on is indexed; each plan below uses an',
  'index and examines about as many keys as it returns.',
  '',
  `Dataset: ${postTotal} posts from \`npm run seed\`. MongoDB ${version}, ${platform()} ${arch()}.`,
  '',
  ...sections,
].join('\n');

const target = fileURLToPath(new URL('../../../../docs/explain/queries.md', import.meta.url));
await mkdir(dirname(target), { recursive: true });
await writeFile(target, body);
console.log(body);
await core.close();
