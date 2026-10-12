import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  S3Client,
  NoSuchKey,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Config } from '../config';

export interface StoredObject {
  body: Buffer;
  contentType: string;
}

// Where the bytes of images live. Local disk for development and tests, S3 or R2 anywhere else.
export interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<StoredObject | null>;
  remove(key: string): Promise<void>;
  // A short-lived URL the browser can load directly (from S3, R2 or a CDN in front of them), or null
  // when the driver cannot make one and the API has to stream the bytes itself.
  signedUrl(key: string, seconds: number): Promise<string | null>;
}

export class LocalStorage implements Storage {
  private readonly root: string;

  constructor(directory: string) {
    this.root = resolve(directory);
  }

  private path(key: string) {
    const full = resolve(join(this.root, key));
    // a key never leaves the storage directory, whatever it contains
    if (!full.startsWith(this.root + '/')) throw new Error('Invalid storage key.');
    return full;
  }

  async put(key: string, body: Buffer, contentType: string) {
    const file = this.path(key);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, body);
    await writeFile(`${file}.type`, contentType);
  }

  async get(key: string) {
    try {
      const file = this.path(key);
      const [body, contentType] = await Promise.all([
        readFile(file),
        readFile(`${file}.type`, 'utf8'),
      ]);
      return { body, contentType };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async remove(key: string) {
    const file = this.path(key);
    await Promise.all([rm(file, { force: true }), rm(`${file}.type`, { force: true })]);
  }

  async signedUrl() {
    return null;
  }
}

export class S3Storage implements Storage {
  private readonly client: S3Client;
  private ready: Promise<void> | null = null;

  constructor(
    private readonly bucket: string,
    options: { endpoint?: string; region: string; accessKeyId?: string; secretAccessKey?: string },
  ) {
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      // MinIO and R2 style endpoints address the bucket in the path
      forcePathStyle: Boolean(options.endpoint),
      credentials:
        options.accessKeyId && options.secretAccessKey
          ? { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey }
          : undefined,
    });
  }

  // Creates the bucket the first time it is needed, which keeps local MinIO setup to one command.
  private ensureBucket() {
    this.ready ??= this.client
      .send(new HeadBucketCommand({ Bucket: this.bucket }))
      .then(() => undefined)
      .catch(async () => {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      });
    return this.ready;
  }

  async put(key: string, body: Buffer, contentType: string) {
    await this.ensureBucket();
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    );
  }

  async get(key: string) {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const body = Buffer.from(await res.Body!.transformToByteArray());
      return { body, contentType: res.ContentType ?? 'application/octet-stream' };
    } catch (error) {
      if (error instanceof NoSuchKey) return null;
      throw error;
    }
  }

  async remove(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  signedUrl(key: string, seconds: number) {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: seconds,
    });
  }
}

export function createStorage(config: Config): Storage {
  if (config.STORAGE_DRIVER === 's3') {
    return new S3Storage(config.S3_BUCKET, {
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      accessKeyId: config.S3_ACCESS_KEY_ID,
      secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    });
  }
  return new LocalStorage(config.MEDIA_DIR);
}
