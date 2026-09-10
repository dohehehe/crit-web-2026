import "server-only";

import { cache } from "react";
import { sectionPathSlug } from "@/lib/sections/getSectionHref";
import { createAdminClient } from "@/lib/supabase/admin";

export const getSections = cache(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sections")
    .select("id,name,slug,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
});

export async function getSectionByPathSlug(pathSlug) {
  const normalized = pathSlug.trim().toLowerCase();
  const sections = await getSections();

  return sections.find((section) => sectionPathSlug(section) === normalized) ?? null;
}
