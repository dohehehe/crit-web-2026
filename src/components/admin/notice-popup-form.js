"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import EditorClient from "./EditorClient";
import styles from "./post-form.module.css";

const POPUP_SELECT = "id,content,link_url,is_active";

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
    link_url: "",
    is_active: false,
  };
}

function popupToForm(popup) {
  return {
    link_url: popup.link_url ?? "",
    is_active: Boolean(popup.is_active),
  };
}

function NoticePopupFormFields({ mode, popupId, initialValues, initialContent }) {
  const router = useRouter();
  const editorRef = useRef(null);
  const isEdit = mode === "edit";

  const { mutate: createPopup, isLoading: isCreating, error: createError } =
    useApiMutation("POST");
  const { mutate: updatePopup, isLoading: isUpdating, error: updateError } =
    useApiMutation("PATCH");
  const { mutate: deletePopup, isLoading: isDeleting, error: deleteError } =
    useApiMutation("DELETE");

  const [form, setForm] = useState(initialValues);
  const [editorError, setEditorError] = useState(null);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setEditorError(null);

    let content = null;

    try {
      if (!editorRef.current?.isReady?.()) {
        throw new Error("에디터가 아직 준비되지 않았습니다.");
      }

      const savedData = await editorRef.current.save();
      content = serializeEditorContent(savedData);
    } catch (error) {
      setEditorError(error.message ?? "에디터 내용을 저장하지 못했습니다.");
      return;
    }

    const payload = {
      link_url: form.link_url.trim() || null,
      content,
      is_active: form.is_active,
    };

    try {
      if (isEdit) {
        await updatePopup(`notice_popup/${popupId}`, payload);
      } else {
        await createPopup("notice_popup", payload);
      }

      router.push("/admin/notice");
    } catch {
      // mutation error state handles display
    }
  }

  async function handleDelete() {
    if (!isEdit || !popupId) {
      return;
    }

    if (!window.confirm("이 팝업을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await deletePopup(`notice_popup/${popupId}`);
      router.push("/admin/notice");
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
          <span className="caption">Link URL</span>
          <input
            className={styles.input}
            type="url"
            value={form.link_url}
            onChange={(event) => updateField("link_url", event.target.value)}
            placeholder="https://"
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
      </div>

      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} p-bold`}>콘텐츠</h2>

        <div className={styles.field}>
          <span className="caption">Content</span>
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
          <button type="submit" className={`${styles.submitButton} caption`} disabled={isSaving}>
            {isSaving && !isDeleting ? "저장 중…" : isEdit ? "수정 저장" : "생성"}
          </button>
          <Link href="/admin/notice" className={`${styles.cancelButton} caption`}>
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

export function NoticePopupForm({ mode, popupId }) {
  const isEdit = mode === "edit";

  const {
    data: popupData,
    isLoading: popupLoading,
    error: popupError,
  } = useAdminQuery(`notice_popup/${popupId}`, {
    params: { select: POPUP_SELECT },
    enabled: isEdit && Boolean(popupId),
  });

  if (isEdit && popupLoading) {
    return <p className={`${styles.status} caption gray-65`}>팝업 불러오는 중…</p>;
  }

  if (isEdit && popupError) {
    return (
      <p className={`${styles.error} caption`}>
        팝업을 불러오지 못했습니다: {popupError.message}
      </p>
    );
  }

  if (isEdit && !popupData) {
    return null;
  }

  const initialValues = isEdit ? popupToForm(popupData) : emptyForm();
  const initialContent = isEdit ? parseContent(popupData.content) : null;
  const formKey = isEdit ? popupId : "new";

  return (
    <NoticePopupFormFields
      key={formKey}
      mode={mode}
      popupId={popupId}
      initialValues={initialValues}
      initialContent={initialContent}
    />
  );
}
