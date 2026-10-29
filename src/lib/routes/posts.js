import { getSectionMode } from "@/lib/admin/section-mode";
import { getSectionHref, sectionPathSlug } from "@/lib/sections/getSectionHref";
import {
  getJournalCritIssuePath,
  getJournalCritPostPath,
  isJournalCritPostPath,
} from "@/lib/routes/journalCrit";
import { toPostPathSegment } from "@/lib/routes/slugPath";

const SECTION_POST_DETAIL_PREFIXES = ["/channel", "/workshop", "/current"];

export function isPostDetailPath(pathname) {
  if (isJournalCritPostPath(pathname)) {
    return true;
  }

  return SECTION_POST_DETAIL_PREFIXES.some((prefix) => {
    if (!pathname.startsWith(`${prefix}/`)) {
      return false;
    }

    const segments = pathname.slice(prefix.length).split("/").filter(Boolean);

    return segments.length === 1;
  });
}

export function getPostSegment(post) {
  return post?.slug || post?.id || "";
}

export function getPostPath(post, options = {}) {
  const segment = getPostSegment(post);

  if (!segment) {
    return "/";
  }

  const section = post?.section;
  const issueNumber = options.issueNumber ?? post?.issueNumber;

  if (section && getSectionMode(section) === "journal") {
    if (issueNumber) {
      return getJournalCritPostPath(issueNumber, segment);
    }

    return "/";
  }

  const pathSlug = section ? sectionPathSlug(section) : "";

  if (!pathSlug) {
    return "/";
  }

  return `/${pathSlug}/${encodeURIComponent(toPostPathSegment(segment))}`;
}

export function getPostBackLink(post) {
  const section = post?.section;
  const issueNumber = post?.issueNumber;

  if (section && getSectionMode(section) === "journal" && issueNumber) {
    return {
      href: getJournalCritIssuePath(issueNumber),
      label: `Issue ${issueNumber}`,
    };
  }

  if (section) {
    return {
      href: getSectionHref(section),
      label: section.name ?? section.slug ?? "",
    };
  }

  return null;
}
