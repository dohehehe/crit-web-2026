import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("authors").select("id").limit(1);

    if (error) {
      return jsonError(error.message, 503);
    }

    return jsonOk({ status: "connected" });
  } catch (error) {
    return jsonError(error.message, 500);
  }
}
