"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/admin/layout/admin-nav.module.css";

const NAV_ITEMS = [
  { href: "/admin/contents", label: "콘텐츠", match: "/admin/contents" },
  { href: "/admin/notice", label: "공지", match: "/admin/notice" },
  { href: "/admin/info", label: "정보", match: "/admin/info" },
];

function isActive(pathname, match) {
  return pathname === match || pathname.startsWith(`${match}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="관리자 메뉴">
      <div className={styles.inner}>
        <Link href="/admin" className={`${styles.brand} menu-en`}>
          CRIT 관리자
        </Link>
        <ul className={styles.list}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.match);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.link} menu-en${active ? ` ${styles.linkActive}` : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
