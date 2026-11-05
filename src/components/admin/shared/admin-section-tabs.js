"use client";

import Link from "next/link";
import styles from "@/components/admin/shared/admin-section-tabs.module.css";

function TabLink({ tab, isSelected, href }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isSelected}
      className={`${styles.tab} menu-en${isSelected ? ` ${styles.tabActive}` : ""}`}
    >
      {tab.name || tab.slug}
    </Link>
  );
}

export function AdminSectionTabs({ sections, selectedId, hrefFor, trailingTabs = [] }) {
  return (
    <div className={styles.tabsRow}>
      <div className={styles.tabs} role="tablist" aria-label="섹션">
        {sections.map((section) => (
          <TabLink
            key={section.id}
            tab={section}
            isSelected={section.id === selectedId}
            href={hrefFor(section.id)}
          />
        ))}
      </div>

      {trailingTabs.length > 0 && (
        <div className={styles.trailingTabs} role="tablist" aria-label="기타">
          {trailingTabs.map((tab) => (
            <TabLink
              key={tab.id}
              tab={tab}
              isSelected={tab.id === selectedId}
              href={hrefFor(tab.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
