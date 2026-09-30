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
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return normalizeIssue(data?.[0] ?? null);
});

function parseIssueNumber(value) {
  const normalized = String(value ?? "").trim();
  const num = Number(normalized);

  return Number.isNaN(num) ? null : num;
}

function compareIssueNumberDesc(a, b) {
  const aNum = parseIssueNumber(a.issueNumber);
  const bNum = parseIssueNumber(b.issueNumber);

  if (aNum === null && bNum === null) {
    return 0;
  }

  if (aNum === null) {
    return 1;
  }

  if (bNum === null) {
    return -1;
  }

  return bNum - aNum;
}

export const getOtherIssues = cache(async (currentIssueNumber, currentIssueId) => {
  const current = parseIssueNumber(currentIssueNumber);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("issues")
    .select(ISSUE_LIST_SELECT)
    .eq("is_active", true)
    .order("issue_number", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map(normalizeIssueSummary)
    .filter((issue) => {
      if (currentIssueId && issue.id === currentIssueId) {
        return false;
      }

      const num = parseIssueNumber(issue.issueNumber);
      return current === null || num !== current;
    })
    .sort(compareIssueNumberDesc);
});
