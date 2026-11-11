const INCOMING_IMAGE_PATH = /^incoming\/\d+-[a-z0-9]+\.(jpg|png|webp|gif)$/;

function createStorageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildImageStoragePath(extension) {
  return `images/${createStorageId()}.${extension}`;
}

export function buildIncomingImagePath(extension) {
  return `incoming/${createStorageId()}.${extension}`;
}

export function isIncomingImagePath(path) {
  return typeof path === "string" && INCOMING_IMAGE_PATH.test(path);
}
