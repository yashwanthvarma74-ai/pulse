import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { processImage } from '@pulse/core';
import { ObjectId } from 'mongodb';
import { createApiContext, type ApiContext } from './test/context';

let ctx: ApiContext;
beforeAll(async () => (ctx = await createApiContext()));
afterAll(() => ctx.close());

const png = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 3, background: '#4f46e5' } })
    .png()
    .toBuffer();

describe('image uploads', () => {
  it('accept an image, and attach it to a post once it is processed', async () => {
    const me = await ctx.guest();
    const upload = await me.agent
      .post('/media')
      .set('Content-Type', 'image/png')
      .send(await png(800, 600))
      .expect(201);
    expect(upload.body.media.status).toBe('processing');
    const id = upload.body.media.id;

    await me.agent
      .post('/posts')
      .send({ text: 'too early', mediaIds: [id] })
      .expect(400);
    await processImage(ctx.core, new ObjectId(id));
    const post = await me.agent
      .post('/posts')
      .send({ text: '', mediaIds: [id] })
      .expect(201);
    expect(post.body.post.media[0]).toMatchObject({ id, status: 'ready', width: 800 });

    const image = await me.agent.get(`/media/${id}/640`).expect(200);
    expect(image.headers['content-type']).toBe('image/webp');
    expect((await sharp(image.body).metadata()).width).toBe(640);
  });

  it('reject something that is not an image, nothing at all, and no session', async () => {
    const me = await ctx.guest();
    await me.agent
      .post('/media')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('not an image'))
      .expect(400);
    await me.agent.post('/media').set('Content-Type', 'image/png').expect(400);
    await ctx
      .agent()
      .post('/media')
      .set('Content-Type', 'image/png')
      .send(await png(10, 10))
      .expect(401);
  });

  it('are shown only to people who can see the post they belong to', async () => {
    const author = await ctx.guest();
    const stranger = await ctx.guest();
    const upload = await author.agent
      .post('/media')
      .set('Content-Type', 'image/png')
      .send(await png(400, 400))
      .expect(201);
    const id = upload.body.media.id;
    await processImage(ctx.core, new ObjectId(id));

    // before it is attached, only its owner can load it
    await author.agent.get(`/media/${id}/320`).expect(200);
    await stranger.agent.get(`/media/${id}/320`).expect(404);

    await author.agent
      .post('/posts')
      .send({ text: 'followers only photo', visibility: 'followers', mediaIds: [id] })
      .expect(201);
    await stranger.agent.get(`/media/${id}/320`).expect(404);
    await stranger.agent.get(`/media/${id}`).expect(404);
    await author.agent.get(`/media/${id}`).expect(200);
    await author.agent.get('/media/not-an-id/320').expect(404);
  });

  it('answer with the nearest width for an unusual size request', async () => {
    const me = await ctx.guest();
    const upload = await me.agent
      .post('/media')
      .set('Content-Type', 'image/png')
      .send(await png(2000, 1000))
      .expect(201);
    await processImage(ctx.core, new ObjectId(upload.body.media.id));
    const image = await me.agent.get(`/media/${upload.body.media.id}/500`).expect(200);
    expect((await sharp(image.body).metadata()).width).toBe(640);
    await me.agent.get(`/media/${upload.body.media.id}/abc`).expect(200);
  });
});

// With S3 (MinIO locally and in CI) the API checks access and then redirects to a signed URL, so the
// bytes come from the bucket (or the CDN in front of it) and not through the API.
describe.skipIf(!process.env.S3_TEST_ENDPOINT)('image delivery from S3', () => {
  it('redirects the right person to a signed URL and sends everyone else away', async () => {
    const s3 = await createApiContext({
      STORAGE_DRIVER: 's3',
      S3_ENDPOINT: process.env.S3_TEST_ENDPOINT!,
      S3_BUCKET: `pulse-api-test-${Date.now()}`,
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: 'minioadmin',
      S3_SECRET_ACCESS_KEY: 'minioadmin',
    });
    try {
      const owner = await s3.guest();
      const stranger = await s3.guest();
      const upload = await owner.agent
        .post('/media')
        .set('Content-Type', 'image/png')
        .send(await png(800, 600))
        .expect(201);
      await processImage(s3.core, new ObjectId(upload.body.media.id));
      await owner.agent
        .post('/posts')
        .send({ text: 'for followers', visibility: 'followers', mediaIds: [upload.body.media.id] })
        .expect(201);

      const redirect = await owner.agent
        .get(`/media/${upload.body.media.id}/640`)
        .redirects(0)
        .expect(302);
      expect(redirect.headers.location).toContain('X-Amz-Signature');
      const bytes = await fetch(redirect.headers.location!);
      expect(bytes.status).toBe(200);
      expect((await sharp(Buffer.from(await bytes.arrayBuffer())).metadata()).width).toBe(640);

      await stranger.agent.get(`/media/${upload.body.media.id}/640`).redirects(0).expect(404);
    } finally {
      await s3.close();
    }
  });
});
