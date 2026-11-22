import { ADMIN_SCOPE } from "@/lib/api/constants";
import { handleCreate, handleList } from "@/lib/api/handlers";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { HOME_POST_PAGE_SIZE } from "@/lib/posts/constants";
import { getPosts } from "@/lib/posts/getPosts";

const MAX_LIMIT = 30;
const MAX_OFFSET = 10000;

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;

  if (searchParams.get("scope") === ADMIN_SCOPE) {
    const authError = await requireAdminApi();

    if (authError) {
      return authError;
    }

    return handleList("posts", request);
  }

  const limit = clampInt(
    searchParams.get("limit"),
    HOME_POST_PAGE_SIZE,
    1,
    MAX_LIMIT
  );
  const offset = clampInt(searchParams.get("offset"), 0, 0, MAX_OFFSET);

  try {
    const posts = await getPosts({ limit, offset });

    return jsonOk(posts, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return jsonError("Failed to load posts", 500);
  }
}

export async function POST(request) {
  const authError = await requireAdminApi();

  if (authError) {
    return authError;
  }

  return handleCreate("posts", request);
}
