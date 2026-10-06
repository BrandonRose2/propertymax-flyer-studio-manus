import type { Express } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { getBucket, getS3, storageConfigured, storagePutExact } from "../storage";

/**
 * Serves stored files at /manus-storage/{key} from the Railway bucket.
 *
 * If a file is not in the bucket yet and LEGACY_ASSET_BASE is set (the old Manus
 * site, e.g. https://propertymax-cyriwzwk.manus.space), it is fetched from there
 * once, copied into the bucket, and served. That way the built-in property photos,
 * logo and paper texture move over automatically the first time they are viewed.
 */
async function copyFromLegacy(key: string): Promise<{ body: Buffer; contentType: string } | null> {
  const base = (process.env.LEGACY_ASSET_BASE || "").replace(/\/+$/, "");
  if (!base) return null;
  const resp = await fetch(`${base}/manus-storage/${key}`, { redirect: "follow" });
  if (!resp.ok) return null;
  const contentType = resp.headers.get("content-type") || "application/octet-stream";
  if (contentType.includes("text/html")) return null; // SPA fallback, not a real file
  const body = Buffer.from(await resp.arrayBuffer());
  await storagePutExact(key, body, contentType).catch(err =>
    console.warn(`[StorageProxy] could not cache ${key} in bucket:`, err),
  );
  return { body, contentType };
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = decodeURIComponent((req.params as Record<string, string>)[0] || "");
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!storageConfigured()) {
      res.status(500).send("Storage not configured");
      return;
    }

    try {
      const obj = await getS3().send(new GetObjectCommand({ Bucket: getBucket(), Key: key }));
      if (obj.ContentType) res.set("Content-Type", obj.ContentType);
      if (obj.ContentLength != null) res.set("Content-Length", String(obj.ContentLength));
      res.set("Cache-Control", "public, max-age=86400");
      (obj.Body as Readable).pipe(res);
      return;
    } catch (err: any) {
      const missing = err?.name === "NoSuchKey" || err?.$metadata?.httpStatusCode === 404;
      if (!missing) {
        console.error("[StorageProxy] bucket read failed:", err);
        res.status(502).send("Storage backend error");
        return;
      }
    }

    try {
      const legacy = await copyFromLegacy(key);
      if (!legacy) {
        res.status(404).send("Not found");
        return;
      }
      res.set("Content-Type", legacy.contentType);
      res.set("Cache-Control", "public, max-age=86400");
      res.send(legacy.body);
    } catch (err) {
      console.error("[StorageProxy] legacy copy failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
