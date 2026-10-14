import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/safeRedirect";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function updateSession(request) {
  const { url, anonKey } = getPublicSupabaseEnv();

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminPath(request.nextUrl.pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      getSafeRedirectPath(
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      ) ?? "/admin"
    );
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
