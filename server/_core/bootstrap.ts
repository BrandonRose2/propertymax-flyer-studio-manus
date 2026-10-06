import path from "node:path";
import fs from "node:fs";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { PROPERTY_PHOTO_IDS } from "@shared/propertyPhotoConfig";
import { propertyPhotos } from "../../drizzle/schema";
import { getDb } from "../db";
import { storageConfigured, storageExists, storagePutExact } from "../storage";
import { SHARED_USER_OPEN_ID } from "./context";

function migrationsFolder(): string {
  // Works both from source (tsx) and from the bundled dist/index.js.
  const candidates = [
    path.resolve(process.cwd(), "drizzle"),
    path.resolve(import.meta.dirname, "..", "drizzle"),
    path.resolve(import.meta.dirname, "../..", "drizzle"),
  ];
  return candidates.find(p => fs.existsSync(path.join(p, "meta", "_journal.json"))) ?? candidates[0];
}

/** Create/upgrade the database tables. */
export async function runMigrations() {
  const db = await getDb();
  if (!db) {
    console.warn("[Bootstrap] DATABASE_URL not set; skipping migrations");
    return;
  }
  await migrate(db, { migrationsFolder: migrationsFolder() });
  console.log("[Bootstrap] Database migrations applied");
}

type LegacyPhoto = {
  propertyId: string;
  label: string;
  originalFileName: string;
  mimeType: string;
  storageKey: string;
  url: string;
  source: "individual" | "zip";
  uploadedAt?: string;
};

async function fetchLegacyList(base: string, propertyId: string): Promise<LegacyPhoto[]> {
  const input = encodeURIComponent(JSON.stringify({ json: { propertyId } }));
  const resp = await fetch(`${base}/api/trpc/photoLibrary.list?input=${input}`);
  if (!resp.ok) throw new Error(`list ${propertyId} failed (${resp.status})`);
  const body = (await resp.json()) as any;
  return (body?.result?.data?.json ?? []) as LegacyPhoto[];
}

/**
 * One-time copy of the photo library from the old Manus site.
 * Runs only when LEGACY_ASSET_BASE is set and the new photo table is empty.
 */
export async function importLegacyPhotos() {
  const base = (process.env.LEGACY_ASSET_BASE || "").replace(/\/+$/, "");
  if (!base || !storageConfigured()) return;
  const db = await getDb();
  if (!db) return;

  const [{ count }] = (await db.select({ count: sql<number>`count(*)` }).from(propertyPhotos)) as any;
  if (Number(count) > 0) return;

  console.log(`[Bootstrap] Importing saved photos from ${base} ...`);
  let imported = 0;
  for (const propertyId of PROPERTY_PHOTO_IDS) {
    let photos: LegacyPhoto[] = [];
    try {
      photos = await fetchLegacyList(base, propertyId);
    } catch (err) {
      console.warn(`[Bootstrap] ${err instanceof Error ? err.message : err}`);
      continue;
    }
    for (const p of photos) {
      try {
        if (!(await storageExists(p.storageKey))) {
          const resp = await fetch(`${base}/manus-storage/${p.storageKey}`);
          if (!resp.ok) throw new Error(`download ${p.storageKey} failed (${resp.status})`);
          await storagePutExact(p.storageKey, Buffer.from(await resp.arrayBuffer()), p.mimeType);
        }
        await db.insert(propertyPhotos).values({
          propertyId: p.propertyId,
          label: p.label,
          originalFileName: p.originalFileName,
          mimeType: p.mimeType,
          storageKey: p.storageKey,
          url: `/manus-storage/${p.storageKey}`,
          source: p.source,
          uploadedByOpenId: SHARED_USER_OPEN_ID,
          ...(p.uploadedAt ? { uploadedAt: new Date(p.uploadedAt) } : {}),
        });
        imported++;
      } catch (err) {
        console.warn(`[Bootstrap] skipped ${p.storageKey}:`, err instanceof Error ? err.message : err);
      }
    }
  }
  console.log(`[Bootstrap] Imported ${imported} saved photo(s) from the Manus site`);
}
