# 0008. Images: processed in the background, served through the policy

Status: accepted

## Context

Photos are large, can carry location data, and must only be visible to people who can see the post they belong to.

## Decision

- **Upload.** The request body is the image. The API checks it by decoding it (not by trusting the content type),
  caps size and pixel count, stores the original and answers "processing". It does not resize.
- **Processing.** A worker makes three WebP variants (320, 640, 1280 px wide, never enlarged) with `sharp`. It
  applies the EXIF rotation and the re-encode drops all metadata. Sizes are recorded, so the page reserves the
  right space before the image loads.
- **Storage.** A `Storage` interface with a local-disk driver (development, tests) and an S3-compatible one (S3, R2,
  MinIO). The S3 driver is tested against MinIO.
- **Delivery.** `GET /media/:id/:width` checks the policy for the post the image is attached to (before it is
  attached, only its owner may load it), then redirects to a signed URL valid for 5 minutes, or streams the bytes
  from local disk.

## Consequences

- A CDN can sit in front of the bucket, but only with signed or short-lived URLs: a public CDN URL would bypass
  the policy. The redirect itself is private-cached for 4 minutes.
- Images only. Video would need a transcoding pipeline, and was left out on purpose.
