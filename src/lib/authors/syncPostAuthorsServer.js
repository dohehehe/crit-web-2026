import "server-only";

import {
  resolveRecordsByName,
  syncPostJoinTable,
} from "@/lib/admin/syncPostNamedLinks";

export async function syncPostAuthorsServer(postId, authorNames) {
  const authorIds = await resolveRecordsByName("authors", authorNames);

  await syncPostJoinTable({
    joinTable: "post_author",
    postColumn: "post_id",
    foreignColumn: "author_id",
    postId,
    foreignIds: authorIds,
  });
}
