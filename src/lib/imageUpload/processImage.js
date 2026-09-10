import {
  IMAGE_UPLOAD_MAX_DIMENSION,
  IMAGE_UPLOAD_MAX_SIZE_MB,
  IMAGE_UPLOAD_WEBP_QUALITY,
} from "./constants";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 파일을 읽을 수 없습니다."));
    };

    image.src = url;
  });
}

function getScaledDimensions(width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width >= height) {
    return {
      width: maxDimension,
      height: Math.round((height / width) * maxDimension),
    };
  }

  return {
    width: Math.round((width / height) * maxDimension),
    height: maxDimension,
  };
}

function getScaledDimensionsByMaxWidth(width, height, maxWidth) {
  if (width <= maxWidth) {
    return { width, height };
  }

  return {
    width: maxWidth,
    height: Math.round((height / width) * maxWidth),
  };
}

function drawToCanvas(image, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이미지 변환에 실패했습니다.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function canvasToWebpBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지 변환에 실패했습니다."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

export async function prepareImageForUpload(file, options = {}) {
  if (!(file instanceof File)) {
    throw new Error("유효하지 않은 파일입니다.");
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error("JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.");
  }

  const maxDimension = options.maxDimension ?? IMAGE_UPLOAD_MAX_DIMENSION;
  const maxWidth = options.maxWidth ?? null;
  const webpQuality = options.webpQuality ?? IMAGE_UPLOAD_WEBP_QUALITY;
  const maxSizeMb = options.maxSizeMb ?? IMAGE_UPLOAD_MAX_SIZE_MB;

  const image = await loadImageFromFile(file);
  const { width, height } =
    maxWidth != null
      ? getScaledDimensionsByMaxWidth(
          image.naturalWidth,
          image.naturalHeight,
          maxWidth
        )
      : getScaledDimensions(
          image.naturalWidth,
          image.naturalHeight,
          maxDimension
        );
  const canvas = drawToCanvas(image, width, height);
  const blob = await canvasToWebpBlob(canvas, webpQuality);
  const maxBytes = maxSizeMb * 1024 * 1024;

  if (blob.size > maxBytes) {
    throw new Error(`이미지 크기는 ${maxSizeMb}MB 이하여야 합니다.`);
  }

  const fileName = `${Date.now()}.webp`;

  return {
    file: new File([blob], fileName, { type: "image/webp" }),
    fileName,
    width,
    height,
  };
}
