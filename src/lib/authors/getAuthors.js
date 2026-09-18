import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AUTHOR_DETAIL_SELECT } from "@/lib/authors/constants";
import { normalizeAuthor } from "@/lib/authors/normalizeAuthor";
import { POST_LIST_SELECT } from "@/lib/posts/constants";
import { normalizePosts } from "@/lib/posts/normalizePost";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export const getAuthorById = cache(async (authorId) => {
  if (!authorId || !isUuid(authorId)) {
    return null;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("authors")
    .select(AUTHOR_DETAIL_SELECT)
    .eq("id", authorId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeAuthor(data);
});

export async function getPostsByAuthorId(authorId, { limit = 100 } = {}) {
  if (!authorId || !isUuid(authorId)) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("is_active", true)
    .eq("author_id", authorId)
    .order("date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return normalizePosts(data);
}
