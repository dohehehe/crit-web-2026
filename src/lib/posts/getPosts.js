import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_POST_LIST_LIMIT,
  POST_LIST_SELECT,
} from "@/lib/posts/constants";
import { normalizePosts } from "@/lib/posts/normalizePost";

function applyOrder(query, orderBy) {
  if (orderBy === "sort_order") {
    return query.order("sort_order", { ascending: true, nullsFirst: false });
  }

  return query.order("date", { ascending: false, nullsFirst: false });
}

export const getPosts = cache(async (options = {}) => {
  const {
    sectionId,
    categoryId,
    issueId,
    limit = DEFAULT_POST_LIST_LIMIT,
    orderBy = "date",
  } = options;

  const supabase = createAdminClient();

  let query = supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("is_active", true)
    .limit(limit);

  if (sectionId) {
    query = query.eq("section_id", sectionId);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (issueId) {
    query = query.eq("issue_id", issueId);
  }

  query = applyOrder(query, orderBy);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return normalizePosts(data);
});

export async function getPostsBySection(sectionId, options = {}) {
  if (!sectionId) {
    return [];
  }

  return getPosts({ ...options, sectionId });
}

export async function getPostsByIssue(issueId, options = {}) {
  if (!issueId) {
    return [];
  }

  return getPosts({
    ...options,
    issueId,
    orderBy: options.orderBy ?? "sort_order",
  });
}
