import { ADMIN_ROLE_NAME, SUBSCRIBER_ROLE_NAME } from "@/lib/auth/constants";

const ROLE_LABELS = {
  [ADMIN_ROLE_NAME]: "관리자",
  [SUBSCRIBER_ROLE_NAME]: "구독자",
};

export function getRoleLabel(roleName) {
  if (!roleName) {
    return "—";
  }

  return ROLE_LABELS[roleName] ?? roleName;
}
