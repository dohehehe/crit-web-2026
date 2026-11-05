export function contentsSectionHref(sectionId) {
  if (!sectionId) return "/admin/contents";
  return `/admin/contents/${sectionId}`;
}

export function noticeListHref(tab = "notice") {
  if (tab === "popup") return "/admin/notice/popup";
  if (tab === "banner") return "/admin/notice/banner";
  return "/admin/notice";
}

export function infoListHref(tab = "info") {
  if (tab === "editors") return "/admin/info/editors";
  if (tab === "users") return "/admin/info/users";
  return "/admin/info";
}
