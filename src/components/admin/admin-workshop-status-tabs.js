"use client";

import {
  WORKSHOP_STATUS,
  WORKSHOP_STATUS_LABELS,
} from "@/lib/admin/workshop-status";
import styles from "./admin-category-tabs.module.css";

const STATUS_TABS = [
  WORKSHOP_STATUS.RECRUITING,
  WORKSHOP_STATUS.CLOSED,
  WORKSHOP_STATUS.PREPARING,
];

export function AdminWorkshopStatusTabs({ selectedStatus, onSelect }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="워크숍 상태">
      <button
        type="button"
        role="tab"
        aria-selected={selectedStatus === null}
        className={`${styles.tab} tag-category${selectedStatus === null ? ` ${styles.tabActive}` : ""}`}
        onClick={() => onSelect(null)}
      >
        전체
      </button>
      {STATUS_TABS.map((status) => {
        const isSelected = selectedStatus === status;

        return (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`${styles.tab} tag-category${isSelected ? ` ${styles.tabActive}` : ""}`}
            onClick={() => onSelect(status)}
          >
            {WORKSHOP_STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}
