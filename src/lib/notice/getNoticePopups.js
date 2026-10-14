import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";

const NOTICE_POPUP_SELECT =
  "id,content,link_url,thumbnail_img,is_active,created_at";

function normalizeNoticePopup(row) {
  if (!row) {
    return null;
  }

  const thumbnailImg = row.thumbnail_img?.trim() || null;
  const linkUrl = row.link_url?.trim() || null;
  const content = row.content ?? null;
  const hasContent = normalizeBlocks(content).length > 0;

  if (!thumbnailImg && !hasContent) {
    return null;
  }

  return {
    id: row.id,
    thumbnailImg,
    linkUrl,
    content,
    hasContent,
  };
}

export const getActiveNoticePopups = cache(
  async function getActiveNoticePopups() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notice_popup")
      .select(NOTICE_POPUP_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(normalizeNoticePopup).filter(Boolean);
  }
);
