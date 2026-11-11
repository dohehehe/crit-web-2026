import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isJournalCritPostPath, JOURNAL_CRIT_PATH_PREFIX } from "@/lib/routes/journalCrit";
import { isPostDetailPath } from "@/lib/routes/posts";
import { slugMatchPattern, toPostPathSegment } from "@/lib/routes/slugPath";
import { getSectionByPathSlug } from "@/lib/sections/getSections";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function decodeSegment(value) {
  try {
    return decodeURIComponent(String(value ?? ""));
  } catch {
    return String(value ?? "");
  }
}

export function normalizeAnalyticsPath(value) {
  const raw = String(value ?? "").trim();

  if (!raw || raw === "Others") {
    return "";
  }

  let path = decodeSegment(raw);

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }

  return path;
}

function parsePostPath(pathname) {
  const path = normalizeAnalyticsPath(pathname);

  if (!path || !isPostDetailPath(path)) {
    return null;
  }

  if (isJournalCritPostPath(path)) {
    const segments = path.slice(JOURNAL_CRIT_PATH_PREFIX.length).split("/").filter(Boolean);

    return {
      path,
      issueNumber: decodeSegment(segments[0]),
      postSlug: decodeSegment(segments.slice(1).join("/")),
    };
  }

  const [sectionSlug, postSlug] = path.split("/").filter(Boolean);

  return {
    path,
    sectionSlug: decodeSegment(sectionSlug),
    postSlug: decodeSegment(postSlug),
  };
}

export function selectTopPostPaths(rows, limit = 10) {
  return rows
    .map((row) => ({
      ...row,
      path: normalizeAnalyticsPath(row.label),
    }))
    .filter((row) => row.path && isPostDetailPath(row.path))
    .sort((a, b) => b.pageviews - a.pageviews || b.visitors - a.visitors)
    .slice(0, limit);
}

function fallbackPost(row) {
  return {
    href: row.path || row.label,
    title: row.path || row.label,
    meta: "",
    pageviews: row.pageviews,
    visitors: row.visitors,
  };
}

async function findIssue(issueNumber) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("issues")
    .select("id, issue_number")
    .eq("issue_number", issueNumber)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] ?? null;
}

async function findPostRecord({ sectionId, issueId, postSlug }) {
  const supabase = createAdminClient();
  let query = supabase.from("posts").select("id, title, slug").eq("section_id", sectionId);

  if (issueId) {
    query = query.eq("issue_id", issueId);
  }

  if (UUID_PATTERN.test(postSlug)) {
    const { data, error } = await query.eq("id", postSlug).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  const normalized = toPostPathSegment(postSlug);
  const { data, error } = await query.ilike("slug", slugMatchPattern(postSlug));

  if (error) {
    throw new Error(error.message);
  }

  return (
    (data ?? []).find((post) => post.slug === postSlug) ??
    (data ?? []).find((post) => toPostPathSegment(post.slug) === normalized) ??
    null
  );
}

async function findViewedPost(pathname) {
  const parsed = parsePostPath(pathname);

  if (!parsed?.postSlug) {
    return null;
  }

  if (parsed.issueNumber) {
    const [issue, section] = await Promise.all([
      findIssue(parsed.issueNumber),
      getSectionByPathSlug("journal-crit"),
    ]);

    if (!issue || !section) {
      return null;
    }

    const post = await findPostRecord({
      sectionId: section.id,
      issueId: issue.id,
      postSlug: parsed.postSlug,
    });

    if (!post?.title) {
      return null;
    }

    return {
      href: parsed.path,
      title: post.title,
      meta: `Issue ${issue.issue_number}`,
    };
  }

  const section = await getSectionByPathSlug(parsed.sectionSlug);

  if (!section) {
    return null;
  }

  const post = await findPostRecord({
    sectionId: section.id,
    postSlug: parsed.postSlug,
  });

  if (!post?.title) {
    return null;
  }

  return {
    href: parsed.path,
    title: post.title,
    meta: section.name ?? section.slug ?? "",
  };
}

export async function rankViewedPosts(rows) {
  const topPaths = selectTopPostPaths(rows);

  return Promise.all(
    topPaths.map(async (row) => {
      try {
        const match = await findViewedPost(row.path);

        if (!match) {
          return fallbackPost(row);
        }

        return {
          ...match,
          pageviews: row.pageviews,
          visitors: row.visitors,
        };
      } catch {
        return fallbackPost(row);
      }
    }),
  );
}
