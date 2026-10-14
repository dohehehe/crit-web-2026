import "server-only";

import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { isAdminUser } from "@/lib/auth/isAdminUser";
import { getSafeRedirectPath } from "@/lib/auth/safeRedirect";

export async function requireAdmin(nextPath = "/admin") {
  const user = await getAuthUser();

  if (!user) {
    const next = getSafeRedirectPath(nextPath) ?? "/admin";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!(await isAdminUser(user.id))) {
    redirect("/");
  }

  return user;
}
