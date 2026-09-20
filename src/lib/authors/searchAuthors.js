import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { AUTHOR_DETAIL_SELECT } from "@/lib/authors/constants";
import { normalizeAuthor } from "@/lib/authors/normalizeAuthor";
import { DEFAULT_POST_LIST_LIMIT } from "@/lib/posts/constants";

function escapeIlikePattern(value) {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function searchAuthors(query) {
  noStore();

  const trimmed = query?.trim();

  if (!trimmed) {
    return [];
  }

  const pattern = `%${escapeIlikePattern(trimmed)}%`;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("authors")
    .select(AUTHOR_DETAIL_SELECT)
    .ilike("name", pattern)
    .order("name", { ascending: true })
    .limit(DEFAULT_POST_LIST_LIMIT);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeAuthor).filter(Boolean);
}
