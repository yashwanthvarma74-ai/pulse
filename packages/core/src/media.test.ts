import { ObjectId } from 'mongodb';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MEDIA_WIDTHS } from '@pulse/shared';
import { handleMedia } from './handlers';
import { deliverVariant, getMedia, nearestWidth, processImage, uploadImage } from './media/media';
import { LocalStorage } from './media/storage';
import { createPost } from './posts';
import { createTestCore, type TestCore } from './test/context';

let core: TestCore;
beforeAll(async () => (core = await createTestCore()));
afterAll(() => core.destroy());

const image = (width: number, height: number, format: 'png' | 'jpeg' | 'gif' = 'png') => {
  const solid = sharp({ create: { width, height, channels: 3, background: '#4f46e5' } });
  return solid[format]().toBuffer();
};

describe('uploading', () => {
  it('stores the original and answers "processing"', async () => {
    const owner = await core.user('up_owner');
    const media = await uploadImage(core, owner._id, await image(800, 400));
    expect(media).toMatchObject({ status: 'processing', width: null });
    expect(await core.storage.get(`originals/${media.id}`)).not.toBeNull();
  });

  it.each([
    ['an empty body', Buffer.alloc(0)],
    ['text pretending to be an image', Buffer.from('<html>not an image</html>')],
    ['random bytes', Buffer.from(Array.from({ length: 200 }, (_, i) => (i * 37) % 256))],
  ])('rejects %s', async (_label, bytes) => {
    const owner = await core.user(`up_bad_${_label.length}`);
    await expect(uploadImage(core, owner._id, bytes)).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an image larger than 8 MB', async () => {
    const owner = await core.user('up_big');
    await expect(
      uploadImage(core, owner._id, Buffer.alloc(8 * 1024 * 1024 + 1)),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('accepts a JPEG and a GIF', async () => {
    const owner = await core.user('up_formats');
    await uploadImage(core, owner._id, await image(100, 100, 'jpeg'));
    await uploadImage(core, owner._id, await image(100, 100, 'gif'));
  });
});

describe('processing', () => {
  it('makes WebP variants at each width without enlarging, and marks the image ready', async () => {
    const owner = await core.user('pr_owner');
    const media = await uploadImage(core, owner._id, await image(2000, 1000));
    await handleMedia(core, { mediaId: media.id });

    const doc = await core.database.media.findOne({ _id: new ObjectId(media.id) });
    expect(doc).toMatchObject({ status: 'ready', width: 2000, height: 1000 });
    for (const width of MEDIA_WIDTHS) {
      const variant = await core.storage.get(`variants/${media.id}/${width}.webp`);
      const meta = await sharp(variant!.body).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.width).toBe(width);
    }
  });

  it('does not make a small image bigger', async () => {
    const owner = await core.user('pr_small');
    const media = await uploadImage(core, owner._id, await image(200, 100));
    await processImage(core, new ObjectId(media.id));
    const variant = await core.storage.get(`variants/${media.id}/1280.webp`);
    expect((await sharp(variant!.body).metadata()).width).toBe(200);
  });

  it('applies the EXIF orientation and drops the metadata', async () => {
    const owner = await core.user('pr_exif');
    const tilted = await sharp({
      create: { width: 400, height: 200, channels: 3, background: '#fff' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const media = await uploadImage(core, owner._id, tilted);
    await processImage(core, new ObjectId(media.id));
    const doc = await core.database.media.findOne({ _id: new ObjectId(media.id) });
    expect(doc).toMatchObject({ width: 200, height: 400 });
    const variant = await core.storage.get(`variants/${media.id}/320.webp`);
    expect((await sharp(variant!.body).metadata()).exif).toBeUndefined();
  });

  it('can run twice, and marks the image failed when the original is gone', async () => {
    const owner = await core.user('pr_twice');
    const media = await uploadImage(core, owner._id, await image(300, 300));
    await processImage(core, new ObjectId(media.id));
    await processImage(core, new ObjectId(media.id));

    const lost = await uploadImage(core, owner._id, await image(300, 300));
    await core.storage.remove(`originals/${lost.id}`);
    await processImage(core, new ObjectId(lost.id));
    expect((await core.database.media.findOne({ _id: new ObjectId(lost.id) }))?.status).toBe(
      'failed',
    );
  });
});

describe('attaching and delivering', () => {
  it("lets a post carry only the author's own finished, unattached images", async () => {
    const author = await core.user('at_author');
    const other = await core.user('at_other');
    const ready = await uploadImage(core, author._id, await image(300, 300));
    await processImage(core, new ObjectId(ready.id));
    const pending = await uploadImage(core, author._id, await image(300, 300));
    const foreign = await uploadImage(core, other._id, await image(300, 300));
    await processImage(core, new ObjectId(foreign.id));

    await expect(
      createPost(core, author, { text: 'x', mediaIds: [pending.id] }),
    ).rejects.toMatchObject({ code: 'media_processing' });
    await expect(
      createPost(core, author, { text: 'x', mediaIds: [foreign.id] }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(createPost(core, author, { text: 'x', mediaIds: ['nope'] })).rejects.toMatchObject(
      { status: 400 },
    );

    const post = await createPost(core, author, { text: '', mediaIds: [ready.id] });
    expect(post.media[0]).toMatchObject({ id: ready.id, status: 'ready' });
    // an image belongs to one post
    await expect(
      createPost(core, author, { text: 'again', mediaIds: [ready.id] }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('serves bytes through the policy: the owner before posting, nobody else', async () => {
    const owner = await core.user('dl_owner');
    const stranger = await core.user('dl_stranger');
    const media = await uploadImage(core, owner._id, await image(300, 300));
    await processImage(core, new ObjectId(media.id));
    const id = new ObjectId(media.id);

    expect(await getMedia(core, await core.viewer(owner), id)).toBeTruthy();
    await expect(getMedia(core, await core.viewer(stranger), id)).rejects.toMatchObject({
      status: 404,
    });

    const doc = await getMedia(core, await core.viewer(owner), id);
    const delivery = await deliverVariant(core, doc, 320);
    expect(delivery).toMatchObject({ kind: 'bytes', contentType: 'image/webp' });
  });

  it('refuses to deliver an image that is not ready', async () => {
    const owner = await core.user('dl_notready');
    const media = await uploadImage(core, owner._id, await image(300, 300));
    const doc = (await core.database.media.findOne({ _id: new ObjectId(media.id) }))!;
    await expect(deliverVariant(core, doc, 320)).rejects.toMatchObject({ status: 404 });
  });

  it('picks the smallest variant that is wide enough', () => {
    expect(nearestWidth(100)).toBe(320);
    expect(nearestWidth(320)).toBe(320);
    expect(nearestWidth(321)).toBe(640);
    expect(nearestWidth(5000)).toBe(1280);
  });
});

describe('local storage', () => {
  it('keeps every key inside its directory', async () => {
    const storage = new LocalStorage(core.config.MEDIA_DIR);
    await expect(storage.put('../escape', Buffer.from('x'), 'text/plain')).rejects.toThrow();
    await expect(storage.get('../../etc/passwd')).rejects.toThrow();
    // a leading slash is not an escape: the key is still resolved inside the directory
    expect(await storage.get('/etc/passwd')).toBeNull();
  });

  it('returns null for a missing object and can remove one', async () => {
    const storage = new LocalStorage(core.config.MEDIA_DIR);
    expect(await storage.get('nothing/here')).toBeNull();
    await storage.put('a/b', Buffer.from('x'), 'text/plain');
    await storage.remove('a/b');
    expect(await storage.get('a/b')).toBeNull();
    expect(await storage.signedUrl()).toBeNull();
  });
});
