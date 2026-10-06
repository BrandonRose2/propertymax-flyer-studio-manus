/**
 * Site-wide logo library for the flyer header. Logos are stored in the same
 * bucket and table as property photos, under a reserved library id.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createPropertyPhoto, listPropertyPhotos, removePropertyPhoto } from "../db";
import { decodeBase64Image, imageLabel, SUPPORTED_PROPERTY_IMAGE_TYPES } from "../propertyPhotoUtils";
import { storagePut } from "../storage";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const LOGO_LIBRARY_ID = "flyer-logos";

const extensionForType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export const logoLibraryRouter = router({
  list: publicProcedure.query(async () => listPropertyPhotos(LOGO_LIBRARY_ID)),

  save: protectedProcedure
    .input(z.object({
      label: z.string().trim().min(1).max(180),
      originalFileName: z.string().trim().min(1).max(220),
      mimeType: z.enum(SUPPORTED_PROPERTY_IMAGE_TYPES),
      dataBase64: z.string().min(4).max(16_000_000),
    }))
    .mutation(async ({ ctx, input }) => {
      let bytes: Buffer;
      try {
        bytes = decodeBase64Image(input.dataBase64);
      } catch (error) {
        const tooLarge = error instanceof Error && error.message === "IMAGE_TOO_LARGE";
        throw new TRPCError({
          code: tooLarge ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST",
          message: tooLarge ? "Logos must be 10 MB or smaller." : "That logo file could not be read.",
        });
      }

      const slug = imageLabel(input.originalFileName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "logo";
      const key = `${LOGO_LIBRARY_ID}/${Date.now()}-${slug}${extensionForType[input.mimeType] ?? ""}`;
      try {
        const stored = await storagePut(key, bytes, input.mimeType);
        return await createPropertyPhoto({
          propertyId: LOGO_LIBRARY_ID,
          label: imageLabel(input.label),
          originalFileName: input.originalFileName,
          mimeType: input.mimeType,
          storageKey: stored.key,
          url: stored.url,
          source: "individual",
          uploadedByOpenId: ctx.user.openId,
        });
      } catch (error) {
        console.error("[LogoLibrary] Failed to save logo", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The logo could not be saved. Please try again." });
      }
    }),

  remove: protectedProcedure
    .input(z.object({ logoId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const removed = await removePropertyPhoto(input.logoId, LOGO_LIBRARY_ID, ctx.user.openId);
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "That logo is no longer in the library." });
      return removed;
    }),
});
