import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { IMAGE_UPLOAD_BUCKET } from "@/lib/imageUpload/constants";
import {
  buildImageStoragePath,
  isIncomingImagePath,
} from "@/lib/imageUpload/buildStoragePath";
import { prepareStoredImage } from "@/lib/imageUpload/toWebp";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export async function POST(request) {
  const authError = await requireAdminApi();
  if (authError) {
    return authError;
  }

  let incomingPath = null;
  let supabase = null;

  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return jsonError("요청 형식이 올바르지 않습니다.", 400);
    }

    if (!isIncomingImagePath(body?.path)) {
      return jsonError("업로드된 이미지를 찾을 수 없습니다.", 400);
    }

    supabase = createAdminClient();
    incomingPath = body.path;

    const { data, error } = await supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .download(incomingPath);

    if (error || !data) {
      return jsonError(
        error?.message ?? "업로드된 이미지를 찾을 수 없습니다.",
        400
      );
    }

    const source = Buffer.from(await data.arrayBuffer());
    const stored = await prepareStoredImage(source);
    const storagePath = buildImageStoragePath("webp");
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .upload(storagePath, stored.buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      return jsonError(uploadError.message, 400);
    }

    const { data: publicData } = supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .getPublicUrl(storagePath);

    const width = stored.width || positiveNumber(body.width);
    const height = stored.height || positiveNumber(body.height);

    return jsonOk({
      url: publicData.publicUrl,
      width,
      height,
    });
  } catch (error) {
    return jsonError(error.message, error.status ?? 500);
  } finally {
    if (supabase && incomingPath) {
      await supabase.storage.from(IMAGE_UPLOAD_BUCKET).remove([incomingPath]);
    }
  }
}
