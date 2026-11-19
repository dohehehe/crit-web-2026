import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { syncPostAuthorsServer } from "@/lib/authors/syncPostAuthorsServer";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const authError = await requireAdminApi();

  if (authError) {
    return authError;
  }

  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return jsonError("게시물을 찾을 수 없습니다.", 404);
  }

  try {
    const body = await request.json();
    await syncPostAuthorsServer(id, body?.names);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error.message ?? "작가를 저장하지 못했습니다.", 400);
  }
}
