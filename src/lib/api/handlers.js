import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { shouldApplyActiveFilter } from "@/lib/api/constants";
import { jsonError, jsonOk } from "@/lib/api/response";
import { applyListQuery, parseListQuery } from "@/lib/api/query";

function mapSupabaseError(error) {
  if (error.code === "PGRST116") {
    return { message: "Resource not found", status: 404 };
  }

  return { message: error.message, status: 400 };
}

export async function handleList(table, request) {
  try {
    const supabase = createAdminClient();
    const searchParams = new URL(request.url).searchParams;
    const queryOptions = parseListQuery(searchParams);

    let query = supabase.from(table).select(queryOptions.select, {
      count: "exact",
    });

    if (shouldApplyActiveFilter(table, queryOptions.scope, searchParams)) {
      query = query.eq("is_active", true);
    }

    query = applyListQuery(query, queryOptions);

    const { data, error, count } = await query;

    if (error) {
      const mapped = mapSupabaseError(error);
      return jsonError(mapped.message, mapped.status);
    }

    return jsonOk({
      items: data ?? [],
      count: count ?? data?.length ?? 0,
      limit: queryOptions.limit,
      offset: queryOptions.offset,
    });
  } catch (error) {
    return jsonError(error.message, 500);
  }
}

export async function handleCreate(table, request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(table)
      .insert(body)
      .select()
      .single();

    if (error) {
      const mapped = mapSupabaseError(error);
      return jsonError(mapped.message, mapped.status);
    }

    return jsonOk(data, { status: 201 });
  } catch (error) {
    return jsonError(error.message, 500);
  }
}

export async function handleGetOne(table, id, request) {
  try {
    const select =
      new URL(request.url).searchParams.get("select") ?? "*";
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq("id", id)
      .single();

    if (error) {
      const mapped = mapSupabaseError(error);
      return jsonError(mapped.message, mapped.status);
    }

    return jsonOk(data);
  } catch (error) {
    return jsonError(error.message, 500);
  }
}

export async function handleUpdate(table, id, request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const mapped = mapSupabaseError(error);
      return jsonError(mapped.message, mapped.status);
    }

    return jsonOk(data);
  } catch (error) {
    return jsonError(error.message, 500);
  }
}

export async function handleDelete(table, id) {
  try {
    const supabase = createAdminClient();

    if (table === "posts") {
      const { error: keywordsError } = await supabase
        .from("post_keywords")
        .delete()
        .eq("post_id", id);

      if (keywordsError) {
        const mapped = mapSupabaseError(keywordsError);
        return jsonError(mapped.message, mapped.status);
      }
    }

    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const mapped = mapSupabaseError(error);
      return jsonError(mapped.message, mapped.status);
    }

    return jsonOk(data);
  } catch (error) {
    return jsonError(error.message, 500);
  }
}
