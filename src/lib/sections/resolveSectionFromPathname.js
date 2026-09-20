import { getSectionHref, isSectionHrefActive } from "@/lib/sections/getSectionHref";

export function resolveSectionFromPathname(pathname, sections) {
  if (!pathname || !sections?.length) {
    return null;
  }

  for (const section of sections) {
    const href = getSectionHref(section);

    if (href === "/") {
      continue;
    }

    if (isSectionHrefActive(pathname, href)) {
      return section;
    }
  }

  return null;
}
