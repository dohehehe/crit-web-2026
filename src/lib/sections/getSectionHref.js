export function sectionPathSlug(section) {
  const slug = (section.slug ?? "").trim();

  if (!slug) {
    return null;
  }

  return slug.toLowerCase().replace(/\s+/g, "-");
}

export function getSectionHref(section) {
  const pathSlug = sectionPathSlug(section);

  if (!pathSlug) {
    return "/";
  }

  return `/${pathSlug}`;
}

export function isSectionHrefActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
