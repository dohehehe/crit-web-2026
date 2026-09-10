export function buildImageStoragePath() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `images/${id}.webp`;
}
