"use client";

import styles from "@/components/admin/shared/admin-section-tabs.module.css";

export function AdminSectionTabs({ sections, selectedId, onSelect }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="섹션">
      {sections.map((section) => {
        const isSelected = section.id === selectedId;

        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`${styles.tab} menu-en${isSelected ? ` ${styles.tabActive}` : ""}`}
            onClick={() => onSelect(section.id)}
          >
            {section.name || section.slug}
          </button>
        );
      })}
    </div>
  );
}
