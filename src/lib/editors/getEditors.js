import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeEditor(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name?.trim() || null,
    nameEn: row.name_en?.trim() || null,
    description: row.description ?? null,
    order: row.order ?? null,
  };
}

export const getEditors = cache(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("editors")
    .select("id,name,name_en,description,order,created_at")
    .order("order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeEditor).filter(Boolean);
});
