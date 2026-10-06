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

import { LOGO_LIBRARY_ID, logoLibraryRouter } from "./logoLibrary";

const user = {
  id: 0, openId: "shared", name: "ApartmentCorp", email: null, loginMethod: "shared", role: "admin" as const,
  createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
};
const ctx = (u: TrpcContext["user"]): TrpcContext => ({
  user: u, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"],
});

describe("logo library router", () => {
  beforeEach(() => vi.resetAllMocks());

  it("stores logos under the shared logo library", async () => {
    mocks.storagePut.mockImplementation(async (key: string) => ({ key, url: `/manus-storage/${key}` }));
    mocks.createPropertyPhoto.mockImplementation(async (record) => ({ id: 7, ...record }));
    const saved = await logoLibraryRouter.createCaller(ctx(user)).save({
      label: "Pelican Bay logo",
      originalFileName: "pelican-bay-logo.png",
      mimeType: "image/png",
      dataBase64: Buffer.from("png-bytes").toString("base64"),
    });
    expect(mocks.storagePut.mock.calls[0]?.[0]).toMatch(new RegExp(`^${LOGO_LIBRARY_ID}/\\d+-pelican-bay-logo\\.png$`));
    expect(saved).toMatchObject({ id: 7, propertyId: LOGO_LIBRARY_ID });
  });

  it("lists and removes logos from the shared library id", async () => {
    mocks.listPropertyPhotos.mockResolvedValue([]);
    await logoLibraryRouter.createCaller(ctx(user)).list();
    expect(mocks.listPropertyPhotos).toHaveBeenCalledWith(LOGO_LIBRARY_ID);
    mocks.removePropertyPhoto.mockResolvedValue({ id: 7 });
    await logoLibraryRouter.createCaller(ctx(user)).remove({ logoId: 7 });
    expect(mocks.removePropertyPhoto).toHaveBeenCalledWith(7, LOGO_LIBRARY_ID, "shared");
  });

  it("rejects uploads without a user", async () => {
    await expect(logoLibraryRouter.createCaller(ctx(null)).save({
      label: "x", originalFileName: "x.png", mimeType: "image/png", dataBase64: "AAAA",
    })).rejects.toThrow();
  });
});
