"use client";

import { usePathname } from "next/navigation";
import { getNavigationSubTitle } from "@/lib/navigation/infoNavItems";
import { resolveSectionFromPathname } from "@/lib/sections/resolveSectionFromPathname";
import styles from "@/components/navigation/Navigation.module.css";

export function NavigationSub({ sections = [] }) {
  const pathname = usePathname();
  const section = resolveSectionFromPathname(pathname, sections);
  const title = section
    ? (section.name ?? section.slug ?? "")
    : getNavigationSubTitle(pathname);

  if (!title) {
    return null;
  }

  return (
    <div className={styles.navigationSub} data-navigation-sub>
      <h1 className="menu-kr">{title}</h1>
    </div>
  );
}
