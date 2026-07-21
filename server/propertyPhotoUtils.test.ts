import { describe, expect, it } from "vitest";
import {
  buildPropertyPhotoStorageKey,
  decodeBase64Image,
  imageLabel,
} from "./propertyPhotoUtils";

describe("property photo utility helpers", () => {
  it("normalizes a human-readable label from a nested image filename", () => {
    expect(imageLabel("Opa Locka/Front_Elevation-01.jpg")).toBe("Front Elevation 01");
  });

  it("creates a property-scoped storage key with the matching image extension", () => {
    const key = buildPropertyPhotoStorageKey("opa-locka", "Front Elevation.png", "image/png");
    expect(key).toMatch(/^property-photos\/opa-locka\/\d+-front-elevation\.png$/);
  });

  it("decodes valid base64 image bytes and rejects malformed data", () => {
    expect(decodeBase64Image("aGVsbG8=").toString()).toBe("hello");
    expect(() => decodeBase64Image("not valid base64!")).toThrow("INVALID_IMAGE_DATA");
  });
});
