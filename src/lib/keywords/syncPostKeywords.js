import { api } from "@/lib/api/fetcher";
import { slugifyKeyword } from "@/lib/keywords/slugify";

async function findOrCreateKeyword(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const existing = await api.get("keywords", {
    "eq.name": trimmed,
    select: "id",
    limit: 1,
    scope: "admin",
  });

  if (existing.items?.length > 0) {
    return existing.items[0].id;
  }

  const created = await api.post("keywords", {
    name: trimmed,
    slug: slugifyKeyword(trimmed) || trimmed,
  });

  return created.id;
}

export async function syncPostKeywords(postId, keywordNames) {
  const uniqueNames = [
    ...new Set(
      keywordNames
        .map((name) => name.trim())
        .filter(Boolean)
    ),
  ];

  const keywordIds = [];

  for (const name of uniqueNames) {
    const keywordId = await findOrCreateKeyword(name);
    if (keywordId) {
      keywordIds.push(keywordId);
    }
  }

  const existing = await api.get("post_keywords", {
    "eq.post_id": postId,
    select: "id,keyword_id",
    limit: 100,
    scope: "admin",
  });

  const existingItems = existing.items ?? [];
  const existingIds = new Set(existingItems.map((item) => item.keyword_id));
  const targetIds = new Set(keywordIds);

  for (const item of existingItems) {
    if (!targetIds.has(item.keyword_id)) {
      await api.delete(`post_keywords/${item.id}`);
    }
  }

  for (const keywordId of keywordIds) {
    if (!existingIds.has(keywordId)) {
      await api.post("post_keywords", {
        post_id: postId,
        keyword_id: keywordId,
      });
    }
  }
}
