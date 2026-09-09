"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import styles from "./sections-nav.module.css";

export function SectionsNav() {
  const { data, isLoading, error } = useApiQuery("sections", {
    params: {
      order: "sort_order.asc",
      limit: 20,
      "eq.is_active": "true",
    },
  });

  if (isLoading) {
    return <p className={styles.status}>섹션 불러오는 중…</p>;
  }

  if (error) {
    return <p className={styles.status}>섹션을 불러오지 못했습니다: {error.message}</p>;
  }

  const sections = data?.items ?? [];

  if (sections.length === 0) {
    return <p className={styles.status}>표시할 섹션이 없습니다.</p>;
  }

  return (
    <nav className={styles.nav} aria-label="Sections">
      <ul className={`${styles.list} menu-en`}>
        {sections.map((section) => (
          <li key={section.id} className={styles.item}>
            <a href={`/${section.slug}`} className={styles.link}>
              {section.slug}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
