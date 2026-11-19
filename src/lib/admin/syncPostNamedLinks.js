import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { slugifyKeyword } from "@/lib/keywords/slugify";

function uniqueNames(names) {
  return [
    ...new Set(
      (names ?? [])
        .map((name) => String(name ?? "").trim())
        .filter(Boolean)
    ),
  ];
}

export async function resolveRecordsByName(table, names) {
  const unique = uniqueNames(names);

  if (unique.length === 0) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(table)
    .select("id,name")
    .in("name", unique);

  if (error) {
    throw new Error(error.message);
  }

  const byName = new Map();

  for (const row of data ?? []) {
    const name = row.name?.trim();

    if (name && !byName.has(name)) {
      byName.set(name, row);
    }
  }

  const missing = unique.filter((name) => !byName.has(name));

  if (missing.length > 0) {
    const { data: created, error: createError } = await supabase
      .from(table)
      .insert(
        missing.map((name) => ({
          name,
          slug: slugifyKeyword(name) || name,
        }))
      )
      .select("id,name");

    if (createError) {
      throw new Error(createError.message);
    }

    for (const row of created ?? []) {
      const name = row.name?.trim();

      if (name && !byName.has(name)) {
        byName.set(name, row);
      }
    }
  }

  return unique.map((name) => byName.get(name)?.id).filter(Boolean);
}

export async function syncPostJoinTable({
  joinTable,
  postColumn,
  foreignColumn,
  postId,
  foreignIds,
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(joinTable)
    .select(`id,${foreignColumn}`)
    .eq(postColumn, postId)
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  const existing = data ?? [];
  const targetIds = new Set(foreignIds);
  const existingForeignIds = new Set(
    existing.map((row) => row[foreignColumn]).filter(Boolean)
  );
  const toDelete = existing
    .filter((row) => !targetIds.has(row[foreignColumn]))
    .map((row) => row.id);
  const toInsert = foreignIds.filter((id) => !existingForeignIds.has(id));

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from(joinTable)
      .delete()
      .in("id", toDelete);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from(joinTable).insert(
      toInsert.map((id) => ({
        [postColumn]: postId,
        [foreignColumn]: id,
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}
