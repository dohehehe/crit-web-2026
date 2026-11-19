import { api } from "@/lib/api/fetcher";

export async function syncPostAuthors(postId, authorNames) {
  await api.put(`admin/posts/${postId}/authors`, { names: authorNames });
}
