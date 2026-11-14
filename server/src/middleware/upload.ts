import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { MAX_IMAGE_BYTES, UPLOAD_DIR } from "../config/upload";
import { ApiError } from "../utils/ApiError";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new ApiError(400, "Only JPEG, PNG or WebP images are allowed")
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadIncidentImage = upload.single("image");

type DetectedImageType = "jpg" | "png" | "webp";

export type StoredImage = {
  url: string;
  storage: "cloudinary" | "local";
  key: string;
};

/**
 * Trust the file bytes, not the browser-supplied MIME type or filename.
 */
function detectImageType(buffer: Buffer): DetectedImageType | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(PNG_SIGNATURE)
  ) {
    return "png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

function uploadToCloudinary(
  file: Express.Multer.File,
  imageType: DetectedImageType
): Promise<StoredImage> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "disha/incidents",
        resource_type: "image",
        allowed_formats: [imageType],
        unique_filename: true,
        overwrite: false,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Cloudinary did not return an image URL"));
          return;
        }

        resolve({
          url: result.secure_url,
          storage: "cloudinary",
          key: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
}

export async function persistIncidentImage(
  file?: Express.Multer.File
): Promise<StoredImage | undefined> {
  if (!file) {
    return undefined;
  }

  const imageType = detectImageType(file.buffer);

  if (!imageType) {
    throw new ApiError(
      400,
      "The uploaded file does not appear to be a valid JPEG, PNG or WebP image"
    );
  }

  if (isCloudinaryConfigured) {
    try {
      return await uploadToCloudinary(file, imageType);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Cloudinary error";
      console.error(`Cloudinary image upload failed: ${message}`);
      throw new ApiError(502, "Image upload failed. Please try again.");
    }
  }

  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${Date.now()}-${crypto
    .randomBytes(8)
    .toString("hex")}.${imageType}`;

  await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);

  return {
    url: `/uploads/${filename}`,
    storage: "local",
    key: filename,
  };
}

export async function removeUploadedImage(image?: StoredImage) {
  if (!image) {
    return;
  }

  if (image.storage === "cloudinary") {
    await cloudinary.uploader.destroy(image.key).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Unknown Cloudinary error";
      console.error(`Cloudinary image cleanup failed: ${message}`);
    });
    return;
  }

  await fs.promises
    .unlink(path.join(UPLOAD_DIR, path.basename(image.key)))
    .catch(() => undefined);
}
