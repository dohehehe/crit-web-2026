const MAX_LIMIT = 100;

export function parseListQuery(searchParams) {
  const select = searchParams.get("select") ?? "*";
  const limit = clampInt(searchParams.get("limit"), 20, 1, MAX_LIMIT);
  const offset = clampInt(searchParams.get("offset"), 0, 0, Number.MAX_SAFE_INTEGER);
  const order = searchParams.get("order");
  const filters = parseFilters(searchParams);

  const scope = searchParams.get("scope");

  return { select, limit, offset, order, filters, scope };
}

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseFilters(searchParams) {
  const filters = [];

  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("eq.")) {
      const column = key.slice(3);
      if (!column) continue;
      filters.push({ op: "eq", column, value });
      continue;
    }

    if (key.startsWith("in.")) {
      const column = key.slice(3);
      if (!column) continue;
      const values = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (values.length > 0) {
        filters.push({ op: "in", column, values });
      }
    }
  }

  return filters;
}

export function applyListQuery(query, { limit, offset, order, filters }) {
  for (const filter of filters) {
    if (filter.op === "in") {
      query = query.in(filter.column, filter.values);
    } else {
      query = query.eq(filter.column, filter.value);
    }
  }

  if (order) {
    const [column, direction = "asc"] = order.split(".");
    query = query.order(column, { ascending: direction !== "desc" });
  }

  return query.range(offset, offset + limit - 1);
}
