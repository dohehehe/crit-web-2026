"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import EditorClient from "@/components/admin/shared/editor/EditorClient";
import styles from "@/components/admin/shared/post-form.module.css";

const EDITOR_SELECT = "id,name,name_en,description,order";
const LIST_HREF = "/admin/info?tab=editors";

function parseContent(content) {
  const blocks = normalizeBlocks(content);

  if (blocks.length === 0) {
    return null;
  }

  return { blocks };
}

function serializeEditorContent(savedData) {
  const blocks = normalizeBlocks(savedData);

  if (blocks.length === 0) {
    return null;
  }

  return { blocks };
}

function emptyForm() {
  return {
    name: "",
    name_en: "",
    order: "",
  };
}

function editorToForm(editor) {
  return {
    name: editor.name ?? "",
    name_en: editor.name_en ?? "",
    order: editor.order == null ? "" : String(editor.order),
  };
}

function parseOrder(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const number = Number(trimmed);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function EditorsFormFields({ mode, editorId, initialValues, initialContent }) {
  const router = useRouter();
  const editorRef = useRef(null);
  const isEdit = mode === "edit";

  const { mutate: createEditor, isLoading: isCreating, error: createError } =
    useApiMutation("POST");
  const { mutate: updateEditor, isLoading: isUpdating, error: updateError } =
    useApiMutation("PATCH");
  const { mutate: deleteEditor, isLoading: isDeleting, error: deleteError } =
    useApiMutation("DELETE");

  const [form, setForm] = useState(initialValues);
  const [editorError, setEditorError] = useState(null);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setEditorError(null);

    let description = null;

    try {
      if (!editorRef.current?.isReady?.()) {
        throw new Error("에디터가 아직 준비되지 않았습니다.");
      }

      const savedData = await editorRef.current.save();
      description = serializeEditorContent(savedData);
    } catch (error) {
      setEditorError(error.message ?? "에디터 내용을 저장하지 못했습니다.");
      return;
    }

    const payload = {
      name: form.name.trim() || null,
      name_en: form.name_en.trim() || null,
      order: parseOrder(form.order),
      description,
    };

    try {
      if (isEdit) {
        await updateEditor(`editors/${editorId}`, payload);
      } else {
        await createEditor("editors", payload);
      }

      router.push(LIST_HREF);
    } catch {
      // mutation error state handles display
    }
  }

  async function handleDelete() {
    if (!isEdit || !editorId) {
      return;
    }

    const label = form.name.trim() || form.name_en.trim() || "이 에디터";

    if (!window.confirm(`${label}을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await deleteEditor(`editors/${editorId}`);
      router.push(LIST_HREF);
    } catch {
      // mutation error state handles display
    }
  }

  const isSaving = isCreating || isUpdating || isDeleting;
  const submitError = createError ?? updateError ?? deleteError;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} p-bold`}>기본 정보</h2>

        <label className={styles.field}>
          <span className="caption">이름</span>
          <input
            className={styles.input}
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="caption">영문 이름</span>
          <input
            className={styles.input}
            type="text"
            value={form.name_en}
            onChange={(event) => updateField("name_en", event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className="caption">순서</span>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            step="any"
            value={form.order}
            onChange={(event) => updateField("order", event.target.value)}
          />
        </label>
      </div>

      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} p-bold`}>소개</h2>

        <div className={styles.field}>
          <EditorClient ref={editorRef} data={initialContent} />
          {editorError && (
            <p className={`${styles.error} caption`}>{editorError}</p>
          )}
        </div>
      </div>

      {submitError && (
        <p className={`${styles.error} caption`}>
          {deleteError ? "삭제하지 못했습니다: " : "저장하지 못했습니다: "}
          {submitError.message}
        </p>
      )}

      <div className={styles.actions}>
        <div className={styles.primaryActions}>
          <button
            type="submit"
            className={`${styles.submitButton} caption`}
            disabled={isSaving}
          >
            {isSaving && !isDeleting ? "저장 중…" : isEdit ? "수정 저장" : "생성"}
          </button>
          <Link href={LIST_HREF} className={`${styles.cancelButton} caption`}>
            취소
          </Link>
        </div>
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
  );
}

export function EditorsForm({ mode, editorId }) {
  const isEdit = mode === "edit";

  const {
    data: editorData,
    isLoading: editorLoading,
    error: editorError,
  } = useAdminQuery(`editors/${editorId}`, {
    params: { select: EDITOR_SELECT },
    enabled: isEdit && Boolean(editorId),
  });

  if (isEdit && editorLoading) {
    return <p className={`${styles.status} caption gray-65`}>에디터 불러오는 중…</p>;
  }

  if (isEdit && editorError) {
    return (
      <p className={`${styles.error} caption`}>
        에디터를 불러오지 못했습니다: {editorError.message}
      </p>
    );
  }

  if (isEdit && !editorData) {
    return null;
  }

  const initialValues = isEdit ? editorToForm(editorData) : emptyForm();
  const initialContent = isEdit ? parseContent(editorData.description) : null;
  const formKey = isEdit ? editorId : "new";

  return (
    <EditorsFormFields
      key={formKey}
      mode={mode}
      editorId={editorId}
      initialValues={initialValues}
      initialContent={initialContent}
    />
  );
}
