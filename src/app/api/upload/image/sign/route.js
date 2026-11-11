import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import {
  IMAGE_UPLOAD_BUCKET,
  IMAGE_UPLOAD_TYPES,
} from "@/lib/imageUpload/constants";
import {
  buildIncomingImagePath,
  isIncomingImagePath,
} from "@/lib/imageUpload/buildStoragePath";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const authError = await requireAdminApi();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const extension = IMAGE_UPLOAD_TYPES[body?.contentType];

    if (!extension) {
      return jsonError(
        "JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.",
        400
      );
    }

    const path = buildIncomingImagePath(extension);
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.token || !isIncomingImagePath(path)) {
      return jsonError(
        error?.message ?? "업로드 경로를 만들지 못했습니다.",
        400
      );
    }

    return jsonOk({
      path,
      token: data.token,
      bucket: IMAGE_UPLOAD_BUCKET,
    });
  } catch (error) {
    return jsonError(error.message, error.status ?? 500);
  }
}
