import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PROPERTY_PHOTO_IDS } from "@shared/propertyPhotoConfig";
import {
  createPropertyPhoto,
  listPropertyPhotos,
} from "../db";
import {
  buildPropertyPhotoStorageKey,
  decodeBase64Image,
  imageLabel,
  MAX_PROPERTY_UPLOAD_BATCH_BYTES,
  SUPPORTED_PROPERTY_IMAGE_TYPES,
} from "../propertyPhotoUtils";
import { storagePut } from "../storage";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const propertyIdSchema = z.enum(PROPERTY_PHOTO_IDS);
const imageInput = z.object({
  propertyId: propertyIdSchema,
  label: z.string().trim().min(1).max(180),
  originalFileName: z.string().trim().min(1).max(220),
  mimeType: z.enum(SUPPORTED_PROPERTY_IMAGE_TYPES),
  source: z.enum(["individual", "zip"]),
  dataBase64: z.string().min(4).max(16_000_000),
});

const uploadInput = z.object({
  photos: z.array(imageInput).min(1).max(20),
});

export const photoLibraryRouter = router({
  list: publicProcedure
    .input(z.object({ propertyId: propertyIdSchema }))
    .query(async ({ input }) => listPropertyPhotos(input.propertyId)),

  saveMany: protectedProcedure.input(uploadInput).mutation(async ({ ctx, input }) => {
    const decodedPhotos = input.photos.map((photo) => {
      try {
        return { photo, bytes: decodeBase64Image(photo.dataBase64) };
      } catch (error) {
        const message = error instanceof Error ? error.message : "INVALID_IMAGE_DATA";
        if (message === "IMAGE_TOO_LARGE") {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Each image must be 10 MB or smaller." });
        }
        throw new TRPCError({ code: "BAD_REQUEST", message: "One of the uploaded images is invalid." });
      }
    });

    const totalBytes = decodedPhotos.reduce((total, entry) => total + entry.bytes.length, 0);
    if (totalBytes > MAX_PROPERTY_UPLOAD_BATCH_BYTES) {
      throw new TRPCError({
        code: "PAYLOAD_TOO_LARGE",
        message: "Upload batches must contain 20 MB or less of image data.",
      });
    }

    const saved = [];
    for (const { photo, bytes } of decodedPhotos) {
      try {
        const storageKey = buildPropertyPhotoStorageKey(
          photo.propertyId,
          photo.originalFileName,
          photo.mimeType,
        );
        const stored = await storagePut(storageKey, bytes, photo.mimeType);
        const record = await createPropertyPhoto({
          propertyId: photo.propertyId,
          label: imageLabel(photo.label),
          originalFileName: photo.originalFileName,
          mimeType: photo.mimeType,
          storageKey: stored.key,
          url: stored.url,
          source: photo.source,
          uploadedByOpenId: ctx.user.openId,
        });
        saved.push(record);
      } catch (error) {
        console.error("[PhotoLibrary] Failed to save property photo", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "The image could not be saved. Please try again.",
        });
      }
    }

    return saved;
  }),
});
