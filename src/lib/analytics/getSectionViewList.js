import "server-only";

import { sortPostsByDateDesc } from "@/lib/admin/sortPostsByDate";
import { getPostViews } from "@/lib/analytics/ga4";
import { normalizeAnalyticsPath } from "@/lib/analytics/rankViewedPosts";
import { getPostPath } from "@/lib/routes/posts";
import { getSections } from "@/lib/sections/getSections";
import { createAdminClient } from "@/lib/supabase/admin";

function viewsByPath(rows) {
  const counts = new Map();

  for (const row of rows) {
    const path = normalizeAnalyticsPath(row.path);

    if (!path) {
      continue;
    }

    counts.set(path, (counts.get(path) ?? 0) + row.views);
  }

  return counts;
}

function compareDateDesc(a, b) {
  const hasDateA = Boolean(a.date);
  const hasDateB = Boolean(b.date);

  if (!hasDateA && !hasDateB) {
    return 0;
  }

  if (!hasDateA) {
    return -1;
  }

  if (!hasDateB) {
    return 1;
  }

  return b.date.localeCompare(a.date);
}

function sortPostsByViewsDesc(posts) {
  return [...posts].sort((a, b) => {
    if (b.views !== a.views) {
      return b.views - a.views;
    }

    const byDate = compareDateDesc(a, b);

    if (byDate !== 0) {
      return byDate;
    }

    return a.title.localeCompare(b.title, "ko");
  });
}

export async function getSectionViewList(sectionId, sort = "date") {
  const sections = await getSections();
  const section = sections.find((item) => item.id === sectionId) ?? null;
  let counts = new Map();
  let viewsError = "";

  try {
    counts = viewsByPath(await getPostViews());
  } catch {
    viewsError = "조회수를 불러오지 못했습니다.";
  }

  if (!section) {
    return { sections, section: null, posts: [], viewsError };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, date, is_active, sections(id, name, slug), issues(issue_number)")
    .eq("section_id", section.id)
    .order("date", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  const posts = (data ?? [])
    .map((post) => {
      const shaped = {
        id: post.id,
        title: post.title ?? "",
        slug: post.slug ?? "",
        section: post.sections,
        issueNumber: post.issues?.issue_number ?? "",
      };
      const href = normalizeAnalyticsPath(getPostPath(shaped)) || "/";
      const meta = [
        shaped.issueNumber ? `Issue ${shaped.issueNumber}` : "",
        post.is_active ? "" : "비공개",
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        id: post.id,
        title: shaped.title || "제목 없음",
        date: post.date ?? "",
        href,
        views: href === "/" ? 0 : (counts.get(href) ?? 0),
        meta,
      };
    });

  const ordered = sort === "views" ? sortPostsByViewsDesc(posts) : sortPostsByDateDesc(posts);

  return { sections, section, posts: ordered, viewsError };
}
