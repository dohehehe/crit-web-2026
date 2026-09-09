"use client";

import { useMemo, useState } from "react";
import { AdminCategoryManageTabs } from "@/components/admin/contents/category/admin-category-manage-tabs";
import { CategoryFormModal } from "@/components/admin/contents/category/category-form-modal";
import styles from "@/components/admin/contents/category/admin-category-manage-controls.module.css";

export function AdminCategoryManageControls({
  sectionId,
  categories,
  selectedId,
  onSelect,
  onChanged,
}) {
  const [modalMode, setModalMode] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedId) ?? null,
    [categories, selectedId]
  );

  function openCreateModal() {
    setEditingCategory(null);
    setModalMode("create");
  }

  function openEditModal(category) {
    const target = category ?? selectedCategory;

    if (!target) {
      return;
    }

    setEditingCategory(target);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingCategory(null);
  }

  function handleSaved({ deleted = false } = {}) {
    onChanged?.();

    if (deleted || modalMode === "create") {
      onSelect?.(null);
    }
  }

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.tabsWrap}>
          <AdminCategoryManageTabs
            categories={categories}
            selectedId={selectedId}
            onSelect={onSelect}
            onEditCategory={openEditModal}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} caption`}
            onClick={openCreateModal}
          >
            + 카테고리
          </button>
          <button
            type="button"
            className={`${styles.actionButton} caption`}
            onClick={() => openEditModal()}
            disabled={!selectedCategory}
          >
            수정
          </button>
        </div>
      </div>

      <CategoryFormModal
        open={modalMode !== null}
        mode={modalMode ?? "create"}
        sectionId={sectionId}
        category={modalMode === "edit" ? editingCategory : null}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </>
  );
}
