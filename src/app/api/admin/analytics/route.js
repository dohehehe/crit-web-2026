import { jsonError } from "@/lib/api/response";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { getPostViews } from "@/lib/analytics/ga4";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) {
    return authError;
  }

  try {
    const views = await getPostViews();

    return Response.json(
      { views },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("GA4 API error:", error);

    return jsonError("통계를 불러오지 못했습니다.", 500);
  }
}
