"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import { useScrolled } from "@/hooks/useScrolled";
import { getSectionHref } from "@/lib/sections/getSectionHref";
import styles from "@/components/navigation/section/SectionNav.module.css";

const HOME_HREF = "/";
const HEADER_SCROLL_THRESHOLD = 140;
const HOME_ICON_WIDTH = 30;
const HOME_ICON_HEIGHT = 22;
const HOME_ICON_DEFAULT = "/icon-home-Default.svg";
const HOME_ICON_HOVER = "/icon-home-Hover.svg";

function getSectionLabel(section, useKorean) {
  if (useKorean) {
    return section.name ?? section.slug ?? "";
  }

  return section.slug ?? section.name ?? "";
}

function getHomeAriaLabel(pathname, useKorean) {
  if (pathname === HOME_HREF || useKorean) {
    return "홈";
  }

  return "Home";
}

export function SectionNavList({ sections }) {
  const pathname = usePathname();
  const { isOpen } = useNavigationMenu();
  const isScrolled = useScrolled(HEADER_SCROLL_THRESHOLD);
  const [hoveredHref, setHoveredHref] = useState(null);
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
              aria-label={getHomeAriaLabel(
                pathname,
                isHomeActive || hoveredHref === HOME_HREF,
              )}
              aria-current={isHomeActive ? "page" : undefined}
              onMouseEnter={() => setHoveredHref(HOME_HREF)}
              onMouseLeave={() => setHoveredHref(null)}
              onFocus={() => setHoveredHref(HOME_HREF)}
              onBlur={() => setHoveredHref(null)}
            >
              <Image
                src={
                  isHomeActive || hoveredHref === HOME_HREF
                    ? HOME_ICON_HOVER
                    : HOME_ICON_DEFAULT
                }
                alt=""
                width={HOME_ICON_WIDTH}
                height={HOME_ICON_HEIGHT}
                className={styles.homeIcon}
                aria-hidden
              />
            </Link>
          </li>
        ) : null}
        {sections.map((section) => {
          const href = getSectionHref(section);
          const isActive =
            pathname === href ||
            (href === "/journal-crit" && pathname.startsWith("/journal-crit/")) ||
            (href === "/channel" && pathname.startsWith("/channel/"));
          const useKorean = isActive || hoveredHref === href;

          return (
            <li key={section.id} className={styles.item}>
              <Link
                href={href}
                className={useKorean ? "menu-kr" : "menu-en"}
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={() => setHoveredHref(href)}
                onMouseLeave={() => setHoveredHref(null)}
                onFocus={() => setHoveredHref(href)}
                onBlur={() => setHoveredHref(null)}
              >
                {getSectionLabel(section, useKorean)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
