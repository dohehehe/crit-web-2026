"use client";

import styles from "./admin-category-tabs.module.css";

export function AdminCategoryTabs({
  categories,
  selectedId,
  onSelect,
  onEditCategory,
  showAllTab = true,
  ariaLabel = "카테고리",
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {showAllTab && (
        <button
          type="button"
          role="tab"
          aria-selected={selectedId === null}
          className={`${styles.tab} tag-category${selectedId === null ? ` ${styles.tabActive}` : ""}`}
          onClick={() => onSelect(null)}
        >
          전체
        </button>
      )}
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        const isInactive = category.is_active === false;

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`${styles.tab} tag-category${isSelected ? ` ${styles.tabActive}` : ""}${
              isInactive ? ` ${styles.tabInactive}` : ""
            }`}
            onClick={() => onSelect(category.id)}
            onDoubleClick={() => onEditCategory?.(category)}
          >
            {category.name || category.slug}
          </button>
        );
      })}
    </div>
  );
}
