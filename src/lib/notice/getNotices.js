import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  NOTICE_LIST_SELECT,
  NOTICE_PAGE_SIZE,
} from "@/lib/notice/constants";

function normalizeNotice(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title?.trim() || null,
    date: row.date ?? null,
    content: row.content ?? null,
    isActive: Boolean(row.is_active),
    isPrimary: Boolean(row.is_primary),
    createdAt: row.created_at ?? null,
  };
}

function applyNoticeOrder(query) {
  return query
    .order("is_primary", { ascending: false, nullsFirst: false })
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
}

export const getNoticesPage = cache(async function getNoticesPage({
  page = 1,
  pageSize = NOTICE_PAGE_SIZE,
} = {}) {
  const safePage = Math.max(1, Number.parseInt(String(page), 10) || 1);
  const safePageSize = Math.max(
    1,
    Number.parseInt(String(pageSize), 10) || NOTICE_PAGE_SIZE
  );
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const supabase = createAdminClient();
  let query = supabase
    .from("notice")
    .select(NOTICE_LIST_SELECT, { count: "exact" })
    .eq("is_active", true);

  query = applyNoticeOrder(query).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  return {
    items: (data ?? []).map(normalizeNotice).filter(Boolean),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
});
