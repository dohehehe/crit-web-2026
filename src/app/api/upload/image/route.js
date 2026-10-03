import { jsonError, jsonOk } from "@/lib/api/response";
import { IMAGE_UPLOAD_BUCKET, IMAGE_UPLOAD_TYPES } from "@/lib/imageUpload/constants";
import { buildImageStoragePath } from "@/lib/imageUpload/buildStoragePath";
import { prepareStoredImage } from "@/lib/imageUpload/toWebp";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("파일이 필요합니다.", 400);
    }

    const extension = IMAGE_UPLOAD_TYPES[file.type];

    if (!extension) {
      return jsonError("JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.", 400);
    }

    const source = Buffer.from(await file.arrayBuffer());
    const stored = await prepareStoredImage(source, {
      sourceType: file.type,
      sourceBytes: file.size,
    });
    const storagePath = buildImageStoragePath("webp");
    const supabase = createAdminClient();

    const { error } = await supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .upload(storagePath, stored.buffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      return jsonError(error.message, 400);
    }

    const { data } = supabase.storage
      .from(IMAGE_UPLOAD_BUCKET)
      .getPublicUrl(storagePath);

    const width = stored.width || Number(formData.get("width")) || null;
    const height = stored.height || Number(formData.get("height")) || null;

    return jsonOk({
      url: data.publicUrl,
      width: Number.isFinite(width) ? width : null,
      height: Number.isFinite(height) ? height : null,
    });
  } catch (error) {
    return jsonError(error.message, error.status ?? 500);
  }
}
