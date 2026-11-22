import "server-only";

import {
  resolveRecordsByName,
  syncPostJoinTable,
} from "@/lib/admin/syncPostNamedLinks";

export async function syncPostContributorsServer(postId, contributorNames) {
  const authorIds = await resolveRecordsByName("authors", contributorNames);

  await syncPostJoinTable({
    joinTable: "post_contributor",
    postColumn: "post_id",
    foreignColumn: "author_id",
    postId,
    foreignIds: authorIds,
  });
}
