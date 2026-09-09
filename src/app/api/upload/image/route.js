import { jsonError, jsonOk } from "@/lib/api/response";
import { IMAGE_UPLOAD_BUCKET } from "@/lib/imageUpload/constants";
import { buildImageStoragePath } from "@/lib/imageUpload/buildStoragePath";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("파일이 필요합니다.", 400);
    }

    if (file.type !== "image/webp") {
      return jsonError("WebP 이미지만 업로드할 수 있습니다.", 400);
    }

    if (file.size > MAX_BYTES) {
      return jsonError("파일 크기가 너무 큽니다.", 400);
    }

    const storagePath = buildImageStoragePath();
    const supabase = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      return jsonError(error.message, 400);
    }

    const { data } = supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .getPublicUrl(storagePath);

    const width = Number(formData.get("width")) || null;
    const height = Number(formData.get("height")) || null;

    return jsonOk({
      url: data.publicUrl,
      width: Number.isFinite(width) ? width : null,
      height: Number.isFinite(height) ? height : null,
    });
  } catch (error) {
    return jsonError(error.message, 500);
  }
}
