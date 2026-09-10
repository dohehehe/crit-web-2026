"use client";

import styles from "@/components/admin/shared/admin-section-tabs.module.css";

function TabButton({ tab, isSelected, onSelect }) {
  return (
    <button
      key={tab.id}
      type="button"
      role="tab"
      aria-selected={isSelected}
      className={`${styles.tab} menu-en${isSelected ? ` ${styles.tabActive}` : ""}`}
      onClick={() => onSelect(tab.id)}
    >
      {tab.name || tab.slug}
    </button>
  );
}

export function AdminSectionTabs({ sections, selectedId, onSelect, trailingTabs = [] }) {
  return (
    <div className={styles.tabsRow}>
      <div className={styles.tabs} role="tablist" aria-label="섹션">
        {sections.map((section) => (
          <TabButton
            key={section.id}
            tab={section}
            isSelected={section.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {trailingTabs.length > 0 && (
        <div className={styles.trailingTabs} role="tablist" aria-label="기타">
          {trailingTabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isSelected={tab.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
