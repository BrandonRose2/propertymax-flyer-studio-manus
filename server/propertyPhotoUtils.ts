import type { PropertyPhotoId } from "@shared/propertyPhotoConfig";

export const SUPPORTED_PROPERTY_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export type SupportedPropertyImageType = (typeof SUPPORTED_PROPERTY_IMAGE_TYPES)[number];

export const MAX_PROPERTY_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_PROPERTY_UPLOAD_BATCH_BYTES = 20 * 1024 * 1024;

const extensionForType: Record<SupportedPropertyImageType, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export function imageLabel(value: string) {
  const baseName = value
    .split(/[\\/]/)
    .pop()
    ?.replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (baseName || "Property photo").slice(0, 180);
}

export function buildPropertyPhotoStorageKey(
  propertyId: PropertyPhotoId,
  originalFileName: string,
  mimeType: SupportedPropertyImageType,
) {
  const label = imageLabel(originalFileName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "property-photo";

  return `property-photos/${propertyId}/${Date.now()}-${label}${extensionForType[mimeType]}`;
}

export function decodeBase64Image(dataBase64: string) {
  if (!dataBase64 || dataBase64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(dataBase64)) {
    throw new Error("INVALID_IMAGE_DATA");
  }

  const bytes = Buffer.from(dataBase64, "base64");
  if (!bytes.length) throw new Error("INVALID_IMAGE_DATA");
  if (bytes.length > MAX_PROPERTY_IMAGE_BYTES) throw new Error("IMAGE_TOO_LARGE");

  return bytes;
}
