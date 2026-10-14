import "server-only";

import { getAuthUser } from "@/lib/auth/getAuthUser";
import { isAdminUser } from "@/lib/auth/isAdminUser";
import { jsonError } from "@/lib/api/response";

export async function requireAdminApi() {
  const user = await getAuthUser();

  if (!user) {
    return jsonError("로그인이 필요합니다.", 401);
  }

  if (!(await isAdminUser(user.id))) {
    return jsonError("관리자만 접근할 수 있습니다.", 403);
  }

  return null;
}
