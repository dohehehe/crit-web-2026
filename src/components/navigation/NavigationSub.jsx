"use client";

import { usePathname } from "next/navigation";
import { resolveSectionFromPathname } from "@/lib/sections/resolveSectionFromPathname";
import styles from "@/components/navigation/Navigation.module.css";

export function NavigationSub({ sections = [] }) {
  const pathname = usePathname();
  const section = resolveSectionFromPathname(pathname, sections);

  if (!section) {
    return null;
  }

  const title = section.name ?? section.slug ?? "";

  return (
    <div className={styles.navigationSub}>
      <h1 className="menu-kr">{title}</h1>
    </div>
  );
}
