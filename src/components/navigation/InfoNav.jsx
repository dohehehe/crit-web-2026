"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getInfoNavLabel,
  INFO_NAV_ITEMS,
  isInfoNavActive,
} from "@/lib/navigation/infoNavItems";
import styles from "@/components/navigation/InfoNav.module.css";

export function InfoNav() {
  const pathname = usePathname();

  return (
    <div className={styles.infoList} aria-label="Info">
      <ul className={styles.list}>
        {INFO_NAV_ITEMS.map((item) => {
          const isActive = isInfoNavActive(pathname, item.href);

          return (
            <li key={item.href} className={styles.item}>
              <Link
                href={item.href}
                className={"tag-keyword"}
                aria-current={isActive ? "page" : undefined}
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
