import { api } from "@/lib/api/fetcher";
import { findOrCreateAuthor } from "@/lib/authors/findOrCreateAuthor";

export async function syncPostAuthors(postId, authorNames) {
  const uniqueNames = [
    ...new Set(authorNames.map((name) => name.trim()).filter(Boolean)),
  ];

  const authorIds = [];

  for (const name of uniqueNames) {
    const authorId = await findOrCreateAuthor(name);
    if (authorId) {
      authorIds.push(authorId);
    }
  }

  const existing = await api.get("post_author", {
    "eq.post_id": postId,
    select: "id,author_id",
    limit: 100,
    scope: "admin",
  });

  const existingItems = existing.items ?? [];
  const existingIds = new Set(existingItems.map((item) => item.author_id));
  const targetIds = new Set(authorIds);

  for (const item of existingItems) {
    if (!targetIds.has(item.author_id)) {
      await api.delete(`post_author/${item.id}`);
    }
  }

  for (const authorId of authorIds) {
    if (!existingIds.has(authorId)) {
      await api.post("post_author", {
        post_id: postId,
        author_id: authorId,
      });
    }
  }
}
