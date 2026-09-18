import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const BANNER_SELECT = "id,img_url,link_url,is_active";

function normalizeBanner(row) {
  const imgUrl = row?.img_url?.trim();

  if (!imgUrl) {
    return null;
  }

  const linkUrl = row.link_url?.trim();

  return {
    id: row.id,
    imgUrl,
    linkUrl: linkUrl || null,
  };
}

export async function getRandomActiveBanner() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("banner")
    .select(BANNER_SELECT)
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  const candidates = (data ?? [])
    .map(normalizeBanner)
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
