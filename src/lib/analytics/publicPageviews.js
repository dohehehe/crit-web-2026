export function isAdminRoute(pathname) {
  if (!pathname) {
    return false;
  }

  let path = String(pathname);

  try {
    path = new URL(pathname, "http://localhost").pathname;
  } catch {
    path = String(pathname);
  }

  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }

  return path === "/admin" || path.startsWith("/admin/");
}

export const PUBLIC_PAGEVIEW_FILTER =
  "not (requestPath eq '/admin' or startswith(requestPath, '/admin/'))";
