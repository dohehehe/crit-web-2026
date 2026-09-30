import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_POST_LIST_LIMIT,
  POST_DETAIL_SELECT,
  POST_LIST_SELECT,
} from "@/lib/posts/constants";
import { normalizePostDetail, normalizePosts } from "@/lib/posts/normalizePost";
import { slugMatchPattern, toPostPathSegment } from "@/lib/routes/slugPath";

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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function decodeRouteParam(value) {
  const raw = String(value ?? "");

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function getPostDetail({ sectionId, postSlug, issueId } = {}) {
  const segment = decodeRouteParam(postSlug);

  if (!sectionId || !segment) {
    return null;
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("posts")
    .select(POST_DETAIL_SELECT)
    .eq("is_active", true)
    .eq("section_id", sectionId);

  if (issueId) {
    query = query.eq("issue_id", issueId);
  }

  if (isUuid(segment)) {
    const { data, error } = await query.eq("id", segment).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return normalizePostDetail(data);
  }

  const normalized = toPostPathSegment(segment);
  const { data, error } = await query.ilike("slug", slugMatchPattern(segment));

  if (error) {
    throw new Error(error.message);
  }

  const match =
    (data ?? []).find((post) => post.slug === segment) ??
    (data ?? []).find((post) => toPostPathSegment(post.slug) === normalized) ??
    null;

  return normalizePostDetail(match);
}
