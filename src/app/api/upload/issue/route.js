import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { buildIssueStoragePath } from "@/lib/issueUpload/buildStoragePath";
import {
  ISSUE_FILE_BUCKET,
  ISSUE_FILE_MAX_BYTES,
  ISSUE_FILE_MIME,
} from "@/lib/issueUpload/constants";
import { createAdminClient } from "@/lib/supabase/admin";

const PDF_SIGNATURE = Buffer.from("%PDF-");

function isPdfFile(file) {
  return (
    file.type === ISSUE_FILE_MIME || file.name.toLowerCase().endsWith(".pdf")
  );
}

export async function POST(request) {
  const authError = await requireAdminApi();
  if (authError) {
    return authError;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("파일이 필요합니다.", 400);
    }

    if (!isPdfFile(file)) {
      return jsonError("PDF 파일만 업로드할 수 있습니다.", 400);
    }

    if (file.size > ISSUE_FILE_MAX_BYTES) {
      return jsonError("PDF 파일은 50MB를 넘을 수 없습니다.", 400);
    }

    if (file.size < PDF_SIGNATURE.length) {
      return jsonError("PDF 파일만 업로드할 수 있습니다.", 400);
    }

    const source = Buffer.from(await file.arrayBuffer());

    if (!source.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE)) {
      return jsonError("PDF 파일만 업로드할 수 있습니다.", 400);
    }

    const storagePath = buildIssueStoragePath(file.name);

    if (!storagePath) {
      return jsonError("PDF 파일 이름이 올바르지 않습니다.", 400);
    }

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(ISSUE_FILE_BUCKET)
      .upload(storagePath, source, {
        contentType: ISSUE_FILE_MIME,
        upsert: false,
      });

    if (error) {
      const duplicate = /already exists|duplicate/i.test(error.message ?? "");
      return jsonError(
        duplicate ? "같은 이름의 PDF가 이미 있습니다." : error.message,
        400
      );
    }

    return jsonOk({
      url: storagePath,
      path: storagePath,
    });
  } catch (error) {
    return jsonError(error.message, error.status ?? 500);
  }
}
