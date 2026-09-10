import "server-only";

import { cache } from "react";
import { ISSUE_DETAIL_SELECT, ISSUE_LIST_SELECT } from "@/lib/issues/constants";
import { normalizeIssue, normalizeIssueSummary } from "@/lib/issues/normalizeIssue";
import { createAdminClient } from "@/lib/supabase/admin";

export const getLatestIssue = cache(async () => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("issues")
    .select(ISSUE_DETAIL_SELECT)
    .eq("is_active", true)
    .order("issue_number", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeIssue(data);
});

export const getIssueByNumber = cache(async (issueNumber) => {
  const normalized = String(issueNumber ?? "").trim();

  if (!normalized) {
    return null;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("issues")
    .select(ISSUE_DETAIL_SELECT)
    .eq("is_active", true)
    .eq("issue_number", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeIssue(data);
});

function parseIssueNumber(value) {
  const normalized = String(value ?? "").trim();
  const num = Number(normalized);

  return Number.isNaN(num) ? null : num;
}

export const getPreviousIssues = cache(async (currentIssueNumber) => {
  const current = parseIssueNumber(currentIssueNumber);

  if (current === null) {
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("issues")
    .select(ISSUE_LIST_SELECT)
    .eq("is_active", true)
    .order("issue_number", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map(normalizeIssueSummary)
    .filter((issue) => {
      const num = parseIssueNumber(issue.issueNumber);
      return num !== null && num < current;
    });
});
