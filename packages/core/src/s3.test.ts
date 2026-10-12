import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { S3Storage } from './media/storage';

// Runs against a real S3-compatible server (MinIO locally and in CI). Without one, it is skipped:
//   S3_TEST_ENDPOINT=http://127.0.0.1:9000 npm test -w @pulse/core
const endpoint = process.env.S3_TEST_ENDPOINT;

describe.skipIf(!endpoint)('S3 storage', () => {
  const storage = () =>
    new S3Storage(`pulse-test-${randomBytes(4).toString('hex')}`, {
      endpoint,
      region: 'us-east-1',
      accessKeyId: process.env.S3_TEST_KEY ?? 'minioadmin',
      secretAccessKey: process.env.S3_TEST_SECRET ?? 'minioadmin',
    });

  it('creates its bucket, stores an object and reads it back with its content type', async () => {
    const s3 = storage();
    await s3.put('variants/a/320.webp', Buffer.from('hello'), 'image/webp');
    const object = await s3.get('variants/a/320.webp');
    expect(object?.body.toString()).toBe('hello');
    expect(object?.contentType).toBe('image/webp');
  });

  it('answers null for an object that does not exist, and can delete one', async () => {
    const s3 = storage();
    await s3.put('a', Buffer.from('x'), 'text/plain');
    expect(await s3.get('missing')).toBeNull();
    await s3.remove('a');
    expect(await s3.get('a')).toBeNull();
  });

  it('makes a short-lived signed URL the browser can load directly', async () => {
    const s3 = storage();
    await s3.put('photo', Buffer.from('pixels'), 'image/webp');
    const url = await s3.signedUrl('photo', 60);
    expect(url).toContain('X-Amz-Signature');
    const res = await fetch(url);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('pixels');
    // the same address without the signature is refused
    expect((await fetch(url.split('?')[0]!)).status).toBe(403);
  });

  it('serves an expired signed URL as an error', async () => {
    const s3 = storage();
    await s3.put('photo', Buffer.from('pixels'), 'image/webp');
    const url = await s3.signedUrl('photo', 1);
    await new Promise((resolve) => setTimeout(resolve, 2200));
    expect((await fetch(url)).status).toBe(403);
  });
});
