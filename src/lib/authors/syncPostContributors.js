import { api } from "@/lib/api/fetcher";

export async function syncPostContributors(postId, contributorNames) {
  await api.put(`admin/posts/${postId}/contributors`, {
    names: contributorNames,
  });
}
