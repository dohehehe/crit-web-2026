import "server-only";

import { searchAuthors } from "@/lib/authors/searchAuthors";
import { getPostsBySearchTag, searchPosts } from "@/lib/posts/searchPosts";
import { buildTextSearchEntries, postToSearchEntry } from "@/lib/search/searchResultEntries";

export async function searchByQuery(query) {
  const [posts, authors] = await Promise.all([searchPosts(query), searchAuthors(query)]);

  return buildTextSearchEntries({ posts, authors });
}

export async function searchByTag(tag) {
  const posts = await getPostsBySearchTag(tag);

  return posts.map(postToSearchEntry);
}
