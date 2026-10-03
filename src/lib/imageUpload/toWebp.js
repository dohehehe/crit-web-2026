import "server-only";

import sharp from "sharp";

import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_DIMENSION,
  IMAGE_UPLOAD_MIN_QUALITY,
  IMAGE_UPLOAD_MAX_QUALITY,
} from "@/lib/imageUpload/constants";

const DIMENSION_STEP = 200;

function frameSize(info) {
  const pages = info.pages ?? 1;

  const height =
    pages > 1 && info.height
      ? Math.round(info.height / pages)
      : info.height;

  return {
    width: info.width ?? null,
    height: height ?? null,
  };
}

function orientedSize(metadata) {
  const swap =
    metadata.orientation !== undefined &&
    metadata.orientation >= 5 &&
    metadata.orientation <= 8;

  const width = swap ? metadata.height : metadata.width;

  const height = swap
    ? metadata.width
    : metadata.pageHeight ?? metadata.height;

  return {
    width: width ?? 0,
    height: height ?? 0,
  };
}

async function encodeFitted(buffer, maxDimension, quality) {
  const metadata = await sharp(buffer, {
    animated: true,
    failOn: "none",
  }).metadata();

  const { width, height } = orientedSize(metadata);

  let image = sharp(buffer, {
    animated: true,
    failOn: "none",
  }).rotate();

  if (Math.max(width, height) > maxDimension) {
    image = image.resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const output = await image
    .webp({
      effort: 4,
      quality,
      smartSubsample: true,
    })
    .toBuffer({
      resolveWithObject: true,
    });

  return {
    buffer: output.data,
    ...frameSize(output.info),
  };
}

async function findBestQuality(buffer, maxDimension) {
  let low = IMAGE_UPLOAD_MIN_QUALITY;
  let high = IMAGE_UPLOAD_MAX_QUALITY;

  let best = null;

  while (low <= high) {
    const quality = Math.round((low + high) / 2);

    const encoded = await encodeFitted(
      buffer,
      maxDimension,
      quality
    );

    if (encoded.buffer.byteLength <= IMAGE_UPLOAD_MAX_BYTES) {
      best = encoded;

      // 용량 제한 안에 들어왔으므로
      // 더 높은 quality를 탐색
      low = quality + 1;
    } else {
      // 용량 초과 → quality를 낮춤
      high = quality - 1;
    }
  }

  return best;
}

async function encodeWithinMaxBytes(buffer) {
  let maxDimension = IMAGE_UPLOAD_MAX_DIMENSION;

  while (maxDimension >= 800) {
    const encoded = await findBestQuality(
      buffer,
      maxDimension
    );

    if (encoded) {
      return encoded;
    }

    // 현재 해상도에서 quality 70으로도
    // 500KB 이하가 되지 않는 경우
    // 해상도를 200px 낮추고 다시 quality 100부터 탐색
    maxDimension -= DIMENSION_STEP;
  }

  // 최후의 fallback
  return encodeFitted(
    buffer,
    800,
    IMAGE_UPLOAD_MIN_QUALITY
  );
}

export async function prepareStoredImage(buffer) {
  return encodeWithinMaxBytes(buffer);
}