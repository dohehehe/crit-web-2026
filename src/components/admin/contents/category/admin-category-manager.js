"use client";

import { useState } from "react";
import { AdminCategoryManageControls } from "@/components/admin/contents/category/admin-category-manage-controls";
import styles from "@/components/admin/contents/category/admin-category-manager.module.css";

export function AdminCategoryManager({ sectionId, categories, onChanged }) {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <section className={styles.manager} aria-label="카테고리 관리">
      <p className={`${styles.label} caption black`}>카테고리 관리</p>
      <AdminCategoryManageControls
        sectionId={sectionId}
        categories={categories}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChanged={onChanged}
      />
    </section>
  );
}
