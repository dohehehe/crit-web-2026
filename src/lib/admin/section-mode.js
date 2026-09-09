const CURRENT_SECTION_SLUG = "Current";
const JOURNAL_CRIT_SECTION_SLUG = "Journal Crit";
const CHANNEL_SECTION_SLUG = "Channel";
const WORKSHOP_SECTION_SLUG = "Workshop";

export function getSectionMode(section) {
  if (section?.slug === JOURNAL_CRIT_SECTION_SLUG) return "journal";
  if (section?.slug === CURRENT_SECTION_SLUG) return "current";
  if (section?.slug === CHANNEL_SECTION_SLUG || section?.slug === WORKSHOP_SECTION_SLUG) {
    return "posts";
  }
  return "posts";
}

export function buildPostCreateHref(sectionId, { categoryId, issueId } = {}) {
  const params = new URLSearchParams({ sectionId });
  if (categoryId) params.set("categoryId", categoryId);
  if (issueId) params.set("issueId", issueId);
  return `/admin/posts/new?${params.toString()}`;
}

export function buildIssueCreateHref() {
  return "/admin/issues/new";
}

export function buildIssueEditHref(issueId) {
  return `/admin/issues/${issueId}`;
}
