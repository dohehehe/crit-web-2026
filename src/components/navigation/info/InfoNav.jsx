"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import {
  getInfoNavLabel,
  INFO_NAV_ITEMS,
  isInfoNavActive,
} from "@/lib/navigation/infoNavItems";
import styles from "@/components/navigation/info/InfoNav.module.css";

export function InfoNav() {
  const pathname = usePathname();
  const { isOpen, closeMenu, closeSearch } = useNavigationMenu();

  useEffect(() => {
    closeMenu();
    closeSearch();
  }, [pathname, closeMenu, closeSearch]);

  return (
    <div
      id="info-nav"
      className={`${styles.infoPanel}${isOpen ? ` ${styles.open}` : ""}`}
      aria-label="Info"
    >
      <ul className={styles.infoList}>
        {INFO_NAV_ITEMS.map((item) => {
          const isActive = isInfoNavActive(pathname, item.href);

          return (
            <li key={item.href} className={styles.item}>
              <Link
                href={item.href}
                className="tag-keyword"
                aria-current={isActive ? "page" : undefined}
                onClick={closeMenu}
              >
                {getInfoNavLabel(item, isActive)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
