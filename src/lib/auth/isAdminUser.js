import "server-only";

import { cache } from "react";
import { ADMIN_ROLE_NAME } from "@/lib/auth/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const isAdminUser = cache(async function isAdminUser(userId) {
  if (!userId) {
    return false;
  }

  const supabase = createAdminClient();
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("role_id")
    .eq("id", userId)
    .maybeSingle();

  if (userError || !userRow?.role_id) {
    return false;
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("name")
    .eq("id", userRow.role_id)
    .maybeSingle();

  if (roleError) {
    return false;
  }

  return roleRow?.name === ADMIN_ROLE_NAME;
});
