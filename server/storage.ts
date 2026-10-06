// Storage helpers backed by an S3-compatible bucket (Railway storage bucket).
// Replaces the Manus Forge storage. Objects are served through /manus-storage/{key}
// (see _core/storageProxy.ts), so URLs saved by the Manus version keep working.

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

export function storageConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ENDPOINT &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

export function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("Storage config missing: set S3_BUCKET");
  return bucket;
}

export function getS3(): S3Client {
  if (_client) return _client;
  if (!storageConfigured()) {
    throw new Error(
      "Storage config missing: set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY",
    );
  }
  _client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return _client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/** Store bytes under an exact key (no hash suffix). Used for migrated objects. */
export async function storagePutExact(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const k = normalizeKey(key);
  await getS3().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: k,
      Body: typeof data === "string" ? Buffer.from(data) : data,
      ContentType: contentType,
    }),
  );
  return { key: k, url: `/manus-storage/${k}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  return storagePutExact(appendHashSuffix(normalizeKey(relKey)), data, contentType);
}

export async function storageExists(relKey: string): Promise<boolean> {
  try {
    await getS3().send(new HeadObjectCommand({ Bucket: getBucket(), Key: normalizeKey(relKey) }));
    return true;
  } catch {
    return false;
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  return getSignedUrl(
    getS3(),
    new GetObjectCommand({ Bucket: getBucket(), Key: normalizeKey(relKey) }),
    { expiresIn: 3600 },
  );
}
