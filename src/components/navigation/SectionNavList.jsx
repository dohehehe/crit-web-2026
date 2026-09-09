"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSectionHref } from "@/lib/sections/getSectionHref";
import styles from "@/components/navigation/SectionNav.module.css";

function getSectionLabel(section, isActive) {
  if (isActive) {
    return section.name ?? section.slug ?? "";
  }

  return section.slug ?? section.name ?? "";
}

export function SectionNavList({ sections }) {
  const pathname = usePathname();

  return (
    <div className={styles.sectionList} aria-label="Sections">
      <ul className={styles.list}>
        {sections.map((section) => {
          const href = getSectionHref(section);
          const isActive = pathname === href;

          return (
            <li key={section.id} className={styles.item}>
              <Link
                href={href}
                className="menu-en"
                aria-current={isActive ? "page" : undefined}
              >
                {getSectionLabel(section, isActive)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
