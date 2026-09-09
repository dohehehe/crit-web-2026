"use client";

import styles from "./admin-category-manage-tabs.module.css";

export function AdminCategoryManageTabs({
  categories,
  selectedId,
  onSelect,
  onEditCategory,
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="카테고리 관리">
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        const isInactive = category.is_active === false;

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`${styles.tab} caption${isSelected ? ` ${styles.tabActive}` : ""}${isInactive ? ` ${styles.tabInactive}` : ""
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
