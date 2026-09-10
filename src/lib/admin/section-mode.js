const CURRENT_SECTION_SLUG = "Current";
const JOURNAL_CRIT_SECTION_SLUG = "Journal Crit";
const CHANNEL_SECTION_SLUG = "Channel";
const WORKSHOP_SECTION_SLUG = "Workshop";

function sectionKey(section) {
  return (section?.slug ?? section?.name ?? "").trim().toLowerCase();
}

function matchesSection(section, ...keys) {
  const key = sectionKey(section);
  return keys.some((value) => key === value.trim().toLowerCase());
}

export function getSectionMode(section) {
  if (matchesSection(section, JOURNAL_CRIT_SECTION_SLUG)) return "journal";
  if (matchesSection(section, CURRENT_SECTION_SLUG)) return "current";
  if (matchesSection(section, CHANNEL_SECTION_SLUG)) return "channel";
  if (matchesSection(section, WORKSHOP_SECTION_SLUG)) return "workshop";
  return "posts";
}

export function sectionHasCategories(sectionMode) {
  return (
    sectionMode === "current" ||
    sectionMode === "channel" ||
    sectionMode === "workshop"
  );
}

export function sectionUsesCategoryTabs(sectionMode) {
  return sectionMode === "current" || sectionMode === "channel";
}

export function sectionUsesWorkshopStatusTabs(sectionMode) {
  return sectionMode === "workshop";
}

export function sectionUsesIssuePostSortOrder(sectionMode) {
  return sectionMode === "journal";
}

export function sectionUsesCategoryManagement(sectionMode) {
  return sectionMode === "journal" || sectionMode === "workshop";
}

export function sectionHasMediaFields(sectionMode) {
  return (
    sectionMode === "posts" ||
    sectionMode === "channel" ||
    sectionMode === "workshop"
  );
}

export function buildPostCreateHref(sectionId, { categoryId, issueId } = {}) {
  const params = new URLSearchParams({ sectionId });
  if (categoryId) params.set("categoryId", categoryId);
  if (issueId) params.set("issueId", issueId);
  return `/admin/contents/posts/new?${params.toString()}`;
}

export function buildIssueCreateHref() {
  return "/admin/contents/issues/new";
}

export function buildIssueEditHref(issueId) {
  return `/admin/contents/issues/${issueId}`;
}
