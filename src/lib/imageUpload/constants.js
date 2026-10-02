export const IMAGE_UPLOAD_MAX_DIMENSION = 2400;

export const IMAGE_UPLOAD_MAX_BYTES = 500 * 1024;

export const IMAGE_UPLOAD_MIN_QUALITY = 70;
export const IMAGE_UPLOAD_MAX_QUALITY = 100;
export const IMAGE_UPLOAD_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ?? "gallery";

export const IMAGE_UPLOAD_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
