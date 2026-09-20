import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_POST_LIST_LIMIT,
  POST_SEARCH_SELECT,
} from "@/lib/posts/constants";
import { normalizePosts } from "@/lib/posts/normalizePost";

const SEARCH_RESULT_LIMIT = DEFAULT_POST_LIST_LIMIT;

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function escapeIlikePattern(value) {
  return value.replace(/[%_\\]/g, "\\$&");
}

function mergePostsById(lists) {
  const byId = new Map();

  for (const list of lists) {
    for (const post of list) {
      if (!byId.has(post.id)) {
        byId.set(post.id, post);
      }
    }
  }

  return [...byId.values()].sort((a, b) => {
    const dateA = a.date ?? "";
    const dateB = b.date ?? "";
    return dateB.localeCompare(dateA);
  });
}

async function fetchPosts(queryBuilder) {
  const supabase = createAdminClient();

  let query = supabase
    .from("posts")
    .select(POST_SEARCH_SELECT)
    .eq("is_active", true)
    .order("date", { ascending: false, nullsFirst: false })
    .limit(SEARCH_RESULT_LIMIT);

  query = queryBuilder(query);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return normalizePosts(data);
}

async function fetchPostsByIds(postIds) {
  if (!postIds.length) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SEARCH_SELECT)
    .eq("is_active", true)
    .in("id", postIds)
    .order("date", { ascending: false, nullsFirst: false })
    .limit(SEARCH_RESULT_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  return normalizePosts(data);
}

async function fetchPostIdsByKeywordName(pattern) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("post_keywords")
    .select("post_id, keywords!inner ( name )")
    .ilike("keywords.name", pattern);

  if (error) {
    throw new Error(error.message);
  }

  return [...new Set((data ?? []).map((row) => row.post_id).filter(Boolean))];
}

async function fetchAuthorIdsByName(pattern) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("authors").select("id").ilike("name", pattern);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.id).filter(Boolean);
}

export async function searchPosts(query) {
  noStore();

  const trimmed = query?.trim();

  if (!trimmed) {
    return [];
  }

  const pattern = `%${escapeIlikePattern(trimmed)}%`;

  const [byTitle, authorIds, keywordPostIds] = await Promise.all([
    fetchPosts((query) => query.ilike("title", pattern)),
    fetchAuthorIdsByName(pattern),
    fetchPostIdsByKeywordName(pattern),
  ]);

  const [byAuthor, byKeyword] = await Promise.all([
    authorIds.length
      ? fetchPosts((query) => query.in("author_id", authorIds))
      : Promise.resolve([]),
    fetchPostsByIds(keywordPostIds),
  ]);

  return mergePostsById([byTitle, byAuthor, byKeyword]);
}

export async function getPostsBySearchTag(tag) {
  noStore();

  if (!tag) {
    return [];
  }

  if (tag.startsWith("category-")) {
    const categoryId = tag.slice("category-".length);

    if (!isUuid(categoryId)) {
      return [];
    }

    return fetchPosts((query) => query.eq("category_id", categoryId));
  }

  if (!isUuid(tag)) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("post_keywords")
    .select("post_id")
    .eq("keyword_id", tag);

  if (error) {
    throw new Error(error.message);
  }

  const postIds = [...new Set((data ?? []).map((row) => row.post_id).filter(Boolean))];

  return fetchPostsByIds(postIds);
}
