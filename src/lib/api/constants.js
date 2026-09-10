export const ALLOWED_TABLES = [
  "authors",
  "categories",
  "info",
  "issues",
  "keywords",
  "notice",
  "notice_popup",
  "post_keywords",
  "posts",
  "roles",
  "sections",
  "users",
];

export const ADMIN_SCOPE = "admin";

export const TABLES_WITH_IS_ACTIVE = [
  "sections",
  "categories",
  "posts",
  "issues",
  "notice",
  "notice_popup",
];

export function isAllowedTable(table) {
  return ALLOWED_TABLES.includes(table);
}

export function shouldApplyActiveFilter(table, scope, searchParams) {
  if (scope === ADMIN_SCOPE) return false;
  if (!TABLES_WITH_IS_ACTIVE.includes(table)) return false;
  return !searchParams.has("eq.is_active");
}
