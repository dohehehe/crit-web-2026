const MAX_LIMIT = 100;

export function parseListQuery(searchParams) {
  const select = searchParams.get("select") ?? "*";
  const limit = clampInt(searchParams.get("limit"), 20, 1, MAX_LIMIT);
  const offset = clampInt(searchParams.get("offset"), 0, 0, Number.MAX_SAFE_INTEGER);
  const order = searchParams.get("order");
  const filters = parseFilters(searchParams);

  return { select, limit, offset, order, filters };
}

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseFilters(searchParams) {
  const filters = [];

  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith("eq.")) continue;
    const column = key.slice(3);
    if (!column) continue;
    filters.push({ column, value });
  }

  return filters;
}

export function applyListQuery(query, { limit, offset, order, filters }) {
  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  if (order) {
    const [column, direction = "asc"] = order.split(".");
    query = query.order(column, { ascending: direction !== "desc" });
  }

  return query.range(offset, offset + limit - 1);
}
