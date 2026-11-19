import "server-only";

import {
  resolveRecordsByName,
  syncPostJoinTable,
} from "@/lib/admin/syncPostNamedLinks";

export async function syncPostKeywordsServer(postId, keywordNames) {
  const keywordIds = await resolveRecordsByName("keywords", keywordNames);

  await syncPostJoinTable({
    joinTable: "post_keywords",
    postColumn: "post_id",
    foreignColumn: "keyword_id",
    postId,
    foreignIds: keywordIds,
  });
}
