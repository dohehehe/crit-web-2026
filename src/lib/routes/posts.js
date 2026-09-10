import { getSectionMode } from "@/lib/admin/section-mode";
import { getSectionHref, sectionPathSlug } from "@/lib/sections/getSectionHref";
import { getJournalCritIssuePath, getJournalCritPostPath } from "@/lib/routes/journalCrit";

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

  return `/${pathSlug}/${segment}`;
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
