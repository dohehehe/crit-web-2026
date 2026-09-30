"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import { useScrolled } from "@/hooks/useScrolled";
import { getSectionHref, isSectionHrefActive } from "@/lib/sections/getSectionHref";
import styles from "@/components/navigation/section/SectionNav.module.css";

const HOME_HREF = "/";
const HEADER_SCROLL_THRESHOLD = 140;
const HOME_ICON_SIZE = 10;

function getSectionLabels(section) {
  return {
    en: section.slug ?? section.name ?? "",
    kr: section.name ?? section.slug ?? "",
  };
}

export function SectionNavList({ sections }) {
  const pathname = usePathname();
  const { isOpen } = useNavigationMenu();
  const isScrolled = useScrolled(HEADER_SCROLL_THRESHOLD);
  const isHomeActive = pathname === HOME_HREF;
  const showHome = isScrolled || isOpen;

  return (
    <div
      className={`${styles.sectionList}${isOpen ? ` ${styles.menuOpen}` : ""}`}
      aria-label="Sections"
    >
      <ul className={styles.list}>
        {showHome ? (
          <li className={styles.item}>
            <Link
              href={HOME_HREF}
              className={styles.homeLink}
              aria-label={isHomeActive ? "홈" : "Home"}
              aria-current={isHomeActive ? "page" : undefined}
            >
              <span className={styles.labelStack} aria-hidden>
                <Image
                  src="/home.svg"
                  alt=""
                  width={HOME_ICON_SIZE}
                  height={HOME_ICON_SIZE}
                  className={styles.homeIcon}
                />
                <span className={`${styles.labelKr} menu-kr`}>홈</span>
              </span>
            </Link>
          </li>
        ) : null}
        {sections.map((section) => {
          const href = getSectionHref(section);
          const isActive = isSectionHrefActive(pathname, href);
          const { en, kr } = getSectionLabels(section);

          return (
            <li key={section.id} className={styles.item}>
              <Link
                href={href}
                className={styles.sectionLink}
                aria-label={isActive ? kr : en}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.labelStack} aria-hidden>
                  <span className={`${styles.labelEn} menu-en`}>{en}</span>
                  <span className={`${styles.labelKr} menu-kr`}>{kr}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
