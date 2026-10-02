export function isPortraitSize(width, height) {
  const numericWidth = Number(width);
  const numericHeight = Number(height);

  return numericWidth > 0 && numericHeight > numericWidth;
}

export function attachImageOrientation(holder) {
  const classify = (image) => {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    if (!image.classList.contains("image-tool__image-picture")) {
      return;
    }

    const tool = image.closest(".image-tool");

    if (!tool || !image.naturalWidth || !image.naturalHeight) {
      return;
    }

    tool.classList.toggle(
      "image-tool--portrait",
      image.naturalHeight > image.naturalWidth,
    );
  };

  const onLoad = (event) => {
    classify(event.target);
  };

  holder.addEventListener("load", onLoad, true);
  holder.querySelectorAll("img.image-tool__image-picture").forEach((image) => {
    if (image.complete) {
      classify(image);
    }
  });

  return () => {
    holder.removeEventListener("load", onLoad, true);
  };
}
