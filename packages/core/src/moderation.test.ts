import { ObjectId } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { listOpenReports, reportPost, resolveReport, scanPost } from './moderation';
import { createPost, createReply, getPostItem } from './posts';
import { createTestCore, type TestCore } from './test/context';

let core: TestCore;
beforeAll(
  async () => (core = await createTestCore({ MODERATION_TERMS: 'free crypto, buy followers' })),
);
afterAll(() => core.destroy());

describe('reports', () => {
  it("are saved once per person and post, and show in the moderators' queue", async () => {
    const author = await core.user('mr_author');
    const reporter = await core.user('mr_reporter');
    const mod = await core.user('mr_mod', { moderator: true });
    const item = await createPost(core, author, { text: 'something rude' });
    const viewer = await core.viewer(reporter);

    await reportPost(core, viewer, new ObjectId(item.id), {
      reason: 'harassment',
      details: 'twice',
    });
    await reportPost(core, viewer, new ObjectId(item.id), {
      reason: 'harassment',
      details: 'again',
    });

    const queue = await listOpenReports(core, mod._id);
    const mine = queue.filter((report) => report.post.id === item.id);
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ reason: 'harassment', reporter: { handle: 'mr_reporter' } });
  });

  it('cannot be made against a post the reporter cannot see', async () => {
    const author = await core.user('mr2_author');
    const stranger = await core.user('mr2_stranger');
    const item = await createPost(core, author, { text: 'secret', visibility: 'followers' });
    await expect(
      reportPost(core, await core.viewer(stranger), new ObjectId(item.id), { reason: 'spam' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('are only for moderators to read and settle', async () => {
    const user = await core.user('mr3_user');
    await expect(listOpenReports(core, user._id)).rejects.toMatchObject({ status: 403 });
    await expect(resolveReport(core, user._id, new ObjectId(), 'dismiss')).rejects.toMatchObject({
      status: 403,
    });
  });
});

describe('resolving', () => {
  it('removing a post hides it from everyone but its author and settles every report about it', async () => {
    const author = await core.user('rs_author');
    const a = await core.user('rs_a');
    const b = await core.user('rs_b');
    const mod = await core.user('rs_mod', { moderator: true });
    const item = await createPost(core, author, { text: 'bad post' });
    const id = new ObjectId(item.id);
    await reportPost(core, await core.viewer(a), id, { reason: 'spam' });
    await reportPost(core, await core.viewer(b), id, { reason: 'other' });

    const first = (await listOpenReports(core, mod._id)).find(
      (report) => report.post.id === item.id,
    )!;
    await resolveReport(core, mod._id, new ObjectId(first.id), 'remove');

    expect((await listOpenReports(core, mod._id)).filter((r) => r.post.id === item.id)).toEqual([]);
    await expect(getPostItem(core, await core.viewer(a), id)).rejects.toMatchObject({
      status: 404,
    });
    // the author can still open their own removed post
    expect((await core.database.posts.findOne({ _id: id }))?.status).toBe('removed');
  });

  it('removing a reply takes it off the reply count', async () => {
    const author = await core.user('rr_author');
    const mod = await core.user('rr_mod', { moderator: true });
    const parent = await createPost(core, author, { text: 'thread' });
    const reply = await createReply(
      core,
      author,
      await core.viewer(author),
      new ObjectId(parent.id),
      'rude reply',
    );
    await reportPost(core, await core.viewer(author), new ObjectId(reply.id), {
      reason: 'harassment',
    });
    const report = (await listOpenReports(core, mod._id)).find((r) => r.post.id === reply.id)!;
    await resolveReport(core, mod._id, new ObjectId(report.id), 'remove');
    expect((await core.database.posts.findOne({ _id: new ObjectId(parent.id) }))?.replyCount).toBe(
      0,
    );
  });

  it('dismissing a report keeps the post up', async () => {
    const author = await core.user('rd_author');
    const reporter = await core.user('rd_reporter');
    const mod = await core.user('rd_mod', { moderator: true });
    const item = await createPost(core, author, { text: 'fine post' });
    await reportPost(core, await core.viewer(reporter), new ObjectId(item.id), { reason: 'other' });
    const report = (await listOpenReports(core, mod._id)).find((r) => r.post.id === item.id)!;
    await resolveReport(core, mod._id, new ObjectId(report.id), 'dismiss');
    expect((await core.database.posts.findOne({ _id: new ObjectId(item.id) }))?.status).toBe(
      'visible',
    );
    expect((await listOpenReports(core, mod._id)).filter((r) => r.post.id === item.id)).toEqual([]);
  });

  it('answers 404 for a report that does not exist', async () => {
    const mod = await core.user('rn_mod', { moderator: true });
    await expect(resolveReport(core, mod._id, new ObjectId(), 'dismiss')).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('the automatic first pass', () => {
  it('flags a post containing a configured phrase, once', async () => {
    const author = await core.user('sp_author');
    const mod = await core.user('sp_mod', { moderator: true });
    const item = await createPost(core, author, { text: 'Get FREE CRYPTO now' });
    expect(await scanPost(core, new ObjectId(item.id))).toBe(true);
    expect(await scanPost(core, new ObjectId(item.id))).toBe(true);
    const flagged = (await listOpenReports(core, mod._id)).filter((r) => r.post.id === item.id);
    expect(flagged).toHaveLength(1);
    expect(flagged[0]).toMatchObject({ reporter: null, details: 'Matched "free crypto"' });
  });

  it('leaves clean, missing and removed posts alone', async () => {
    const author = await core.user('sc2_author');
    expect(
      await scanPost(
        core,
        new ObjectId((await createPost(core, author, { text: 'a nice day' })).id),
      ),
    ).toBe(false);
    expect(await scanPost(core, new ObjectId())).toBe(false);
    const removed = await core.post(author, { text: 'buy followers', status: 'removed' });
    expect(await scanPost(core, removed._id)).toBe(false);
  });
});
