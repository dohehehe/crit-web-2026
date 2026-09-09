"use client";

import styles from "./admin-category-tabs.module.css";

export function AdminCategoryTabs({ categories, selectedId, onSelect }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="카테고리">
      <button
        type="button"
        role="tab"
        aria-selected={selectedId === null}
        className={`${styles.tab} tag-category${selectedId === null ? ` ${styles.tabActive}` : ""}`}
        onClick={() => onSelect(null)}
      >
        전체
      </button>
      {categories.map((category) => {
        const isSelected = category.id === selectedId;

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`${styles.tab} tag-category${isSelected ? ` ${styles.tabActive}` : ""}`}
            onClick={() => onSelect(category.id)}
          >
            {category.name || category.slug}
          </button>
        );
      })}
    </div>
  );
}
