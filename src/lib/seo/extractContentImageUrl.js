import { getGallerySlides } from "@/lib/editorjs/gallery";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";

export function extractContentImageUrl(contents) {
  for (const block of normalizeBlocks(contents)) {
    if (block?.type === "image") {
      const url = (block.data?.file?.url ?? block.data?.url)?.trim();

      if (url) {
        return url;
      }
    }

    if (block?.type === "gallery") {
      const [firstSlide] = getGallerySlides(block.data);

      if (firstSlide?.url) {
        return firstSlide.url;
      }
    }
  }

  return null;
}
