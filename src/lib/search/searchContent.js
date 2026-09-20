import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { searchAuthors } from "@/lib/authors/searchAuthors";
import { getPostsBySearchTag, searchPosts } from "@/lib/posts/searchPosts";
import { buildTextSearchEntries, postToSearchEntry } from "@/lib/search/searchResultEntries";
import { createAdminClient } from "@/lib/supabase/admin";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function searchByQuery(query) {
  const [posts, authors] = await Promise.all([searchPosts(query), searchAuthors(query)]);

  return buildTextSearchEntries({ posts, authors });
}

export async function searchByTag(tag) {
  const posts = await getPostsBySearchTag(tag);

  return posts.map(postToSearchEntry);
}

export async function getSearchTagLabel(tag) {
  noStore();

  if (!tag) {
    return null;
  }

  const supabase = createAdminClient();

  if (tag.startsWith("category-")) {
    const categoryId = tag.slice("category-".length);

    if (!isUuid(categoryId)) {
      return null;
    }

    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .eq("id", categoryId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data?.name?.trim() || null;
  }

  if (!isUuid(tag)) {
    return null;
  }

  const { data, error } = await supabase
    .from("keywords")
    .select("name")
    .eq("id", tag)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.name?.trim() || null;
}
