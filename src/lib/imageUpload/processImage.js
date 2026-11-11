import { IMAGE_UPLOAD_TYPES } from "./constants";

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

export async function prepareImageForUpload(file) {
  if (!(file instanceof File)) {
    throw new Error("유효하지 않은 파일입니다.");
  }

  if (!IMAGE_UPLOAD_TYPES[file.type]) {
    throw new Error("JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.");
  }

  let width = null;
  let height = null;

  try {
    const image = await loadImageFromFile(file);
    width = image.naturalWidth || null;
    height = image.naturalHeight || null;
  } catch {
    // 브라우저가 미리보기를 못 열어도 서버의 변환이 치수를 정한다.
  }

  return {
    file,
    fileName: file.name,
    width,
    height,
  };
}
