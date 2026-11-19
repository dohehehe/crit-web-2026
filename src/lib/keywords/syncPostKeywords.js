import { api } from "@/lib/api/fetcher";

export async function syncPostKeywords(postId, keywordNames) {
  await api.put(`admin/posts/${postId}/keywords`, { names: keywordNames });
}
