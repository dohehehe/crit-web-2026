export function getThumbnailUrl(value) {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (value && typeof value === "object" && typeof value.url === "string") {
    return value.url.trim() || null;
  }

  return null;
}

export function parseThumbnail(value) {
  return {
    url: getThumbnailUrl(value) ?? "",
    captionKr: typeof value?.caption_kr === "string" ? value.caption_kr : "",
    captionEn: typeof value?.caption_en === "string" ? value.caption_en : "",
  };
}

export function serializeThumbnail({ url, captionKr = "", captionEn = "" }) {
  const trimmedUrl = url?.trim() ?? "";

  if (!trimmedUrl) {
    return null;
  }

  return {
    url: trimmedUrl,
    caption_kr: captionKr.trim(),
    caption_en: captionEn.trim(),
  };
}
