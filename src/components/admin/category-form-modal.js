"use client";

import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { slugifyKeyword } from "@/lib/keywords/slugify";
import styles from "./category-form-modal.module.css";

function emptyForm() {
  return {
    name: "",
    slug: "",
    sort_order: "",
    is_active: true,
  };
}

function categoryToForm(category) {
  return {
    name: category.name ?? "",
    slug: category.slug ?? "",
    sort_order: category.sort_order != null ? String(category.sort_order) : "",
    is_active: category.is_active !== false,
  };
}

export function CategoryFormModal({
  open,
  mode,
  sectionId,
  category,
  onClose,
  onSaved,
}) {
  const isEdit = mode === "edit";
  const { mutate: createCategory, isLoading: isCreating, error: createError } =
    useApiMutation("POST");
  const { mutate: updateCategory, isLoading: isUpdating, error: updateError } =
    useApiMutation("PATCH");
  const { mutate: deleteCategory, isLoading: isDeleting, error: deleteError } =
    useApiMutation("DELETE");

  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(isEdit && category ? categoryToForm(category) : emptyForm());
    setSlugTouched(false);
  }, [open, isEdit, category]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function updateField(name, value) {
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "name" && !slugTouched) {
        next.slug = slugifyKeyword(value);
      }

      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: form.name.trim() || null,
      slug: form.slug.trim() || null,
      sort_order: form.sort_order.trim() ? Number(form.sort_order) : null,
      is_active: form.is_active,
      section_id: sectionId,
    };

    try {
      if (isEdit) {
        await updateCategory(`categories/${category.id}`, payload);
      } else {
        await createCategory("categories", payload);
      }

      onSaved({});
      onClose();
    } catch {
      // mutation error state handles display
    }
  }

  async function handleDelete() {
    if (!isEdit || !category?.id) {
      return;
    }

    const label = category.name || category.slug || "이 카테고리";
    if (!window.confirm(`${label}을(를) 삭제할까요? 연결된 게시물의 카테고리는 해제됩니다.`)) {
      return;
    }

    try {
      await deleteCategory(`categories/${category.id}`);
      onSaved({ deleted: true });
      onClose();
    } catch {
      // mutation error state handles display
    }
  }

  const isSaving = isCreating || isUpdating || isDeleting;
  const submitError = createError ?? updateError ?? deleteError;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="category-form-title" className="p-bold">
            {isEdit ? "카테고리 수정" : "카테고리 추가"}
          </h2>
          <button
            type="button"
            className={`${styles.closeButton} caption`}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className="caption">Name</span>
            <input
              className={styles.input}
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span className="caption">Slug</span>
            <input
              className={styles.input}
              type="text"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
            />
          </label>

          <label className={styles.field}>
            <span className="caption">Sort Order</span>
            <input
              className={styles.input}
              type="number"
              value={form.sort_order}
              onChange={(event) => updateField("sort_order", event.target.value)}
              min="0"
              step="1"
            />
          </label>

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => updateField("is_active", event.target.checked)}
            />
            <span className="caption">활성 (공개)</span>
          </label>

          {submitError && (
            <p className={`${styles.error} caption`}>
              저장하지 못했습니다: {submitError.message}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={`${styles.submitButton} caption`}
              disabled={isSaving}
            >
              {isSaving ? "저장 중…" : isEdit ? "수정 저장" : "추가"}
            </button>
            <button
              type="button"
              className={`${styles.cancelButton} caption`}
              onClick={onClose}
              disabled={isSaving}
            >
              취소
            </button>
            {isEdit && (
              <button
                type="button"
                className={`${styles.deleteButton} caption`}
                onClick={handleDelete}
                disabled={isSaving}
              >
                {isDeleting ? "삭제 중…" : "삭제"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
