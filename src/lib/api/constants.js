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

export function isAllowedTable(table) {
  return ALLOWED_TABLES.includes(table);
}
