import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const mocks = vi.hoisted(() => ({
  storagePut: vi.fn(),
  createPropertyPhoto: vi.fn(),
  listPropertyPhotos: vi.fn(),
  removePropertyPhoto: vi.fn(),
}));

vi.mock("../storage", () => ({ storagePut: mocks.storagePut }));
vi.mock("../db", () => ({
  createPropertyPhoto: mocks.createPropertyPhoto,
  listPropertyPhotos: mocks.listPropertyPhotos,
  removePropertyPhoto: mocks.removePropertyPhoto,
}));

import { photoLibraryRouter } from "./photoLibrary";

function context(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const owner = {
  id: 1,
  openId: "property-manager",
  name: "Property Manager",
  email: "manager@example.com",
  loginMethod: "manus",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("photo library router", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("stores an authenticated image in property-scoped object storage and metadata", async () => {
    mocks.storagePut.mockResolvedValue({
      key: "property-photos/opa-locka/1-front.jpg",
      url: "/manus-storage/property-photos/opa-locka/1-front.jpg",
    });
    mocks.createPropertyPhoto.mockImplementation(async (record) => ({ id: 24, ...record, uploadedAt: new Date() }));

    const caller = photoLibraryRouter.createCaller(context(owner));
    const result = await caller.saveMany({
      photos: [{
        propertyId: "opa-locka",
        label: "Front elevation",
        originalFileName: "Front elevation.jpg",
        mimeType: "image/jpeg",
        source: "individual",
        dataBase64: "aGVsbG8=",
      }],
    });

    expect(mocks.storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^property-photos\/opa-locka\//),
      expect.any(Buffer),
      "image/jpeg",
    );
    expect(mocks.createPropertyPhoto).toHaveBeenCalledWith(expect.objectContaining({
      propertyId: "opa-locka",
      uploadedByOpenId: "property-manager",
      url: "/manus-storage/property-photos/opa-locka/1-front.jpg",
    }));
    expect(result[0]).toMatchObject({ id: 24, propertyId: "opa-locka" });
  });

  it("lists the existing saved photos for a requested property without requiring sign-in", async () => {
    mocks.listPropertyPhotos.mockResolvedValue([{ id: 25, propertyId: "arbor-crest" }]);

    const caller = photoLibraryRouter.createCaller(context(null));
    await expect(caller.list({ propertyId: "arbor-crest" })).resolves.toEqual([
      { id: 25, propertyId: "arbor-crest" },
    ]);
    expect(mocks.listPropertyPhotos).toHaveBeenCalledWith("arbor-crest");
  });

  it("removes only the authenticated uploader's saved photo from its selected property library", async () => {
    mocks.removePropertyPhoto.mockResolvedValue({
      id: 31,
      propertyId: "arbor-crest",
      label: "Courtyard",
      uploadedByOpenId: "property-manager",
    });

    const caller = photoLibraryRouter.createCaller(context(owner));
    await expect(caller.remove({ propertyId: "arbor-crest", photoId: 31 })).resolves.toMatchObject({
      id: 31,
      propertyId: "arbor-crest",
    });
    expect(mocks.removePropertyPhoto).toHaveBeenCalledWith(31, "arbor-crest", "property-manager");
  });

  it("requires sign-in before a saved photo can be removed", async () => {
    const caller = photoLibraryRouter.createCaller(context(null));
    await expect(caller.remove({ propertyId: "arbor-crest", photoId: 31 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("keeps each newly added property in its own accepted persistent photo scope", async () => {
    const addedPropertyIds = [
      "gates-on-manhattan",
      "grace-townhomes",
      "pelican-bay-apartments",
      "walnut-hill-apartments",
    ];

    mocks.storagePut.mockImplementation(async (key: string) => ({
      key,
      url: `/manus-storage/${key}`,
    }));
    mocks.createPropertyPhoto.mockImplementation(async (record) => ({ id: 100, ...record, uploadedAt: new Date() }));

    const caller = photoLibraryRouter.createCaller(context(owner));
    for (const propertyId of addedPropertyIds) {
      const [saved] = await caller.saveMany({
        photos: [{
          propertyId,
          label: "Validation exterior",
          originalFileName: "validation.jpg",
          mimeType: "image/jpeg",
          source: "individual",
          dataBase64: "aGVsbG8=",
        }],
      });

      expect(saved).toMatchObject({ propertyId });
      expect(mocks.storagePut).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^property-photos/${propertyId}/`)),
        expect.any(Buffer),
        "image/jpeg",
      );
      expect(mocks.createPropertyPhoto).toHaveBeenCalledWith(expect.objectContaining({ propertyId }));
    }
  });
});
