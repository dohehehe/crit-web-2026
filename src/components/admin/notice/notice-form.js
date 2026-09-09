"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import EditorClient from "@/components/admin/shared/editor/EditorClient";
import styles from "@/components/admin/shared/post-form.module.css";

const NOTICE_SELECT = "id,title,content,is_active,date";

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
    title: "",
    date: "",
    is_active: false,
  };
}

function noticeToForm(notice) {
  return {
    title: notice.title ?? "",
    date: notice.date ?? "",
    is_active: Boolean(notice.is_active),
  };
}

function NoticeFormFields({ mode, noticeId, initialValues, initialContent }) {
  const router = useRouter();
  const editorRef = useRef(null);
  const isEdit = mode === "edit";

  const { mutate: createNotice, isLoading: isCreating, error: createError } =
    useApiMutation("POST");
  const { mutate: updateNotice, isLoading: isUpdating, error: updateError } =
    useApiMutation("PATCH");
  const { mutate: deleteNotice, isLoading: isDeleting, error: deleteError } =
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
      title: form.title.trim() || null,
      date: form.date || null,
      content,
      is_active: form.is_active,
    };

    try {
      if (isEdit) {
        await updateNotice(`notice/${noticeId}`, payload);
      } else {
        await createNotice("notice", payload);
      }

      router.push("/admin/notice");
    } catch {
      // mutation error state handles display
    }
  }

  async function handleDelete() {
    if (!isEdit || !noticeId) {
      return;
    }

    const label = form.title.trim() || "이 공지";
    if (!window.confirm(`${label}을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await deleteNotice(`notice/${noticeId}`);
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
          <span className="caption">Title</span>
          <input
            className={styles.input}
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="caption">Date</span>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
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

export function NoticeForm({ mode, noticeId }) {
  const isEdit = mode === "edit";

  const {
    data: noticeData,
    isLoading: noticeLoading,
    error: noticeError,
  } = useAdminQuery(`notice/${noticeId}`, {
    params: { select: NOTICE_SELECT },
    enabled: isEdit && Boolean(noticeId),
  });

  if (isEdit && noticeLoading) {
    return <p className={`${styles.status} caption gray-65`}>공지 불러오는 중…</p>;
  }

  if (isEdit && noticeError) {
    return (
      <p className={`${styles.error} caption`}>
        공지를 불러오지 못했습니다: {noticeError.message}
      </p>
    );
  }

  if (isEdit && !noticeData) {
    return null;
  }

  const initialValues = isEdit ? noticeToForm(noticeData) : emptyForm();
  const initialContent = isEdit ? parseContent(noticeData.content) : null;
  const formKey = isEdit ? noticeId : "new";

  return (
    <NoticeFormFields
      key={formKey}
      mode={mode}
      noticeId={noticeId}
      initialValues={initialValues}
      initialContent={initialContent}
    />
  );
}
