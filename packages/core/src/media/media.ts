import { ObjectId } from 'mongodb';
import sharp from 'sharp';
import { MEDIA_MAX_BYTES, MEDIA_WIDTHS, type Media, type MediaWidth } from '@pulse/shared';
import type { Core } from '../core';
import type { MediaDoc } from '../db';
import { badRequest, notFound } from '../errors';
import { enqueueMedia } from '../events';
import { hex } from '../ids';
import { instruments } from '../metrics';
import { canView, canViewReply, type ViewerContext } from '../policy';

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif']);
// A decoded image is width x height x 4 bytes, so a small file can still be enormous in memory.
const MAX_PIXELS = 40_000_000;

const originalKey = (id: string) => `originals/${id}`;
const variantKey = (id: string, width: number) => `variants/${id}/${width}.webp`;

export const toMedia = (doc: MediaDoc): Media => ({
  id: hex(doc._id),
  status: doc.status,
  width: doc.width,
  height: doc.height,
});

// Accepts an upload. The bytes are checked by decoding them, not by trusting the content type, and the
// resizing happens later in the worker so the request returns straight away.
export async function uploadImage(core: Core, ownerId: ObjectId, bytes: Buffer): Promise<Media> {
  if (bytes.length === 0) throw badRequest('The upload is empty.');
  if (bytes.length > MEDIA_MAX_BYTES) throw badRequest('That image is larger than 8 MB.');

  let format: string | undefined;
  try {
    format = (await sharp(bytes, { limitInputPixels: MAX_PIXELS }).metadata()).format;
  } catch {
    throw badRequest('That file is not an image we can read.');
  }
  if (!format || !ALLOWED_FORMATS.has(format))
    throw badRequest('Use a JPEG, PNG, WebP or GIF image.');

  const doc: MediaDoc = {
    _id: new ObjectId(),
    ownerId,
    postId: null,
    status: 'processing',
    width: null,
    height: null,
    createdAt: new Date(),
  };
  await core.storage.put(originalKey(hex(doc._id)), bytes, `image/${format}`);
  await core.database.media.insertOne(doc);
  await enqueueMedia(core.queues, { mediaId: hex(doc._id) }).catch((error: Error) =>
    core.logger.warn({ err: error.message }, 'could not queue media job'),
  );
  return toMedia(doc);
}

// The worker side: make the resized WebP variants and mark the image ready. Safe to run twice.
export async function processImage(core: Core, mediaId: ObjectId): Promise<void> {
  const doc = await core.database.media.findOne({ _id: mediaId });
  if (!doc || doc.status === 'ready') return;
  const id = hex(mediaId);

  try {
    const original = await core.storage.get(originalKey(id));
    if (!original) throw new Error('original is missing');

    // rotate() applies the EXIF orientation; re-encoding drops the metadata, including GPS position
    const base = sharp(original.body, { limitInputPixels: MAX_PIXELS }).rotate();
    const { info } = await base.clone().toBuffer({ resolveWithObject: true });

    for (const width of MEDIA_WIDTHS) {
      const resized = await base
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      await core.storage.put(variantKey(id, width), resized, 'image/webp');
    }
    await core.database.media.updateOne(
      { _id: mediaId },
      { $set: { status: 'ready', width: info.width, height: info.height } },
    );
    instruments.mediaProcessed.add(1, { outcome: 'ready' });
  } catch (error) {
    core.logger.error({ err: (error as Error).message, mediaId: id }, 'image processing failed');
    await core.database.media.updateOne({ _id: mediaId }, { $set: { status: 'failed' } });
    instruments.mediaProcessed.add(1, { outcome: 'failed' });
  }
}

export async function getMedia(core: Core, viewer: ViewerContext, id: ObjectId): Promise<MediaDoc> {
  const doc = await core.database.media.findOne({ _id: id });
  if (!doc || !(await canViewMedia(core, viewer, doc))) throw notFound('That image');
  return doc;
}

// An image follows the post it is attached to: whoever may see the post may see the image. Before it
// is attached, only the person who uploaded it can.
async function canViewMedia(core: Core, viewer: ViewerContext, doc: MediaDoc): Promise<boolean> {
  if (hex(doc.ownerId) === viewer.id) return true;
  if (!doc.postId) return false;
  const post = await core.database.posts.findOne({ _id: doc.postId });
  if (!post || post.status === 'removed') return false;
  if (!post.parentId) return canView(viewer, post);
  const parent = await core.database.posts.findOne({ _id: post.parentId });
  return parent ? canViewReply(viewer, post, parent) : false;
}

export function nearestWidth(requested: number): MediaWidth {
  return MEDIA_WIDTHS.find((width) => width >= requested) ?? MEDIA_WIDTHS[MEDIA_WIDTHS.length - 1]!;
}

export type MediaDelivery =
  { kind: 'redirect'; url: string } | { kind: 'bytes'; body: Buffer; contentType: string };

// How to hand the image to the browser: a short-lived signed URL when the storage can make one,
// otherwise the bytes themselves.
export async function deliverVariant(
  core: Core,
  doc: MediaDoc,
  width: MediaWidth,
): Promise<MediaDelivery> {
  if (doc.status !== 'ready') throw notFound('That image');
  const key = variantKey(hex(doc._id), width);
  const url = await core.storage.signedUrl(key, 300);
  if (url) return { kind: 'redirect', url };
  const object = await core.storage.get(key);
  if (!object) throw notFound('That image');
  return { kind: 'bytes', body: object.body, contentType: object.contentType };
}
