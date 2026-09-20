import { cache } from "react";
import { SUBSCRIBER_ROLE_NAME } from "@/lib/auth/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export const getSubscriberRoleId = cache(async function getSubscriberRoleId() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .eq("name", SUBSCRIBER_ROLE_NAME)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error(`roles 테이블에 "${SUBSCRIBER_ROLE_NAME}" 역할이 없습니다.`);
  }

  return data.id;
});
