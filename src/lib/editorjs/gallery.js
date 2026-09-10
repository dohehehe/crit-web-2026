export function getGallerySlides(data) {
  if (!Array.isArray(data?.files)) {
    return [];
  }

  return data.files
    .map((file) => ({
      url: file?.url?.trim() ?? "",
      caption: file?.caption ?? "",
    }))
    .filter((slide) => slide.url);
}
