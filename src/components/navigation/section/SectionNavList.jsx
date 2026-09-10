"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import { getSectionHref } from "@/lib/sections/getSectionHref";
import styles from "@/components/navigation/section/SectionNav.module.css";

function getSectionLabel(section, isActive) {
  if (isActive) {
    return section.name ?? section.slug ?? "";
  }

  return section.slug ?? section.name ?? "";
}

export function SectionNavList({ sections }) {
  const pathname = usePathname();
  const { isOpen } = useNavigationMenu();

  return (
    <div
      className={`${styles.sectionList}${isOpen ? ` ${styles.menuOpen}` : ""}`}
      aria-label="Sections"
    >
      <ul className={styles.list}>
        {/* <li className={styles.item}>
          <Link
            href="/"
            className={isOpen && isActive ? "menu-kr" : "menu-en"}
            aria-current={isActive ? "page" : undefined}
          >
            Home
          </Link>
        </li> */}
        {sections.map((section) => {
          const href = getSectionHref(section);
          const isActive = pathname === href;

          return (
            <li key={section.id} className={styles.item}>
              <Link
                href={href}
                className={isOpen && isActive ? "menu-kr" : "menu-en"}
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
