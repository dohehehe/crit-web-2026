"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useImageUpload } from "@/hooks/useImageUpload";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import EditorClient from "./EditorClient";
import styles from "./issue-form.module.css";

const ISSUE_SELECT =
  "id,title,slug,issue_number,description,cover_img,file_url,is_active";

function parseDescription(description) {
  const blocks = normalizeBlocks(description);

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
    slug: "",
    issue_number: "",
    cover_img: "",
    file_url: "",
    is_active: false,
  };
}

function issueToForm(issue) {
  return {
    title: issue.title ?? "",
    slug: issue.slug ?? "",
    issue_number: issue.issue_number ?? "",
    cover_img: issue.cover_img ?? "",
    file_url: issue.file_url ?? "",
    is_active: Boolean(issue.is_active),
  };
}

function IssueFormFields({ mode, issueId, initialValues, initialDescription }) {
  const router = useRouter();
  const editorRef = useRef(null);
  const coverInputRef = useRef(null);
  const isEdit = mode === "edit";

  const { mutate: createIssue, isLoading: isCreating, error: createError } =
    useApiMutation("POST");
  const { mutate: updateIssue, isLoading: isUpdating, error: updateError } =
    useApiMutation("PATCH");
  const { uploadImageToServer } = useImageUpload();

  const [form, setForm] = useState(initialValues);
  const [editorError, setEditorError] = useState(null);
  const [coverError, setCoverError] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setCoverError(null);
    setIsUploadingCover(true);

    try {
      const result = await uploadImageToServer(file);

      if (result.success && result.file?.url) {
        updateField("cover_img", result.file.url);
        return;
      }

      setCoverError(result.error ?? "커버 이미지 업로드에 실패했습니다.");
    } catch (error) {
      setCoverError(error.message ?? "커버 이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
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
      title: form.title.trim() || null,
      slug: form.slug.trim() || null,
      issue_number: form.issue_number.trim() || null,
      description,
      cover_img: form.cover_img.trim() || null,
      file_url: form.file_url.trim() || null,
      is_active: form.is_active,
    };

    try {
      if (isEdit) {
        await updateIssue(`issues/${issueId}`, payload);
      } else {
        await createIssue("issues", payload);
      }

      router.push("/admin/contents");
    } catch {
      // mutation error state handles display
    }
  }

  const isSaving = isCreating || isUpdating;
  const submitError = createError ?? updateError;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} p-bold`}>기본 정보</h2>

        <label className={styles.field}>
          <span className="caption">Vol. (Issue Number)</span>
          <input
            className={styles.input}
            type="text"
            value={form.issue_number}
            onChange={(event) => updateField("issue_number", event.target.value)}
            placeholder="예: 12"
          />
        </label>

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
          <span className="caption">Slug</span>
          <input
            className={styles.input}
            type="text"
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
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
          <span className="caption">Description</span>
          <EditorClient ref={editorRef} data={initialDescription} />
          {editorError && (
            <p className={`${styles.error} caption`}>{editorError}</p>
          )}
        </div>

        <div className={styles.field}>
          <span className="caption">Cover Image</span>
          <input
            ref={coverInputRef}
            className={styles.hiddenFileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleCoverUpload}
          />
          <button
            type="button"
            className={`${styles.coverButton} caption`}
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover || isSaving}
          >
            {isUploadingCover
              ? "업로드 중…"
              : form.cover_img
                ? "이미지 변경"
                : "이미지 추가"}
          </button>
          {form.cover_img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.cover_img}
              alt="커버 미리보기"
              className={styles.coverPreview}
            />
          ) : null}
          {coverError && (
            <p className={`${styles.error} caption`}>{coverError}</p>
          )}
        </div>

        <label className={styles.field}>
          <span className="caption">File URL</span>
          <input
            className={styles.input}
            type="url"
            value={form.file_url}
            onChange={(event) => updateField("file_url", event.target.value)}
            placeholder="PDF 또는 파일 링크"
          />
        </label>
      </div>

      {submitError && (
        <p className={`${styles.error} caption`}>
          저장하지 못했습니다: {submitError.message}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={`${styles.submitButton} caption`} disabled={isSaving}>
          {isSaving ? "저장 중…" : isEdit ? "수정 저장" : "생성"}
        </button>
        <Link href="/admin/contents" className={`${styles.cancelButton} caption`}>
          취소
        </Link>
      </div>
    </form>
  );
}

export function IssueForm({ mode, issueId }) {
  const isEdit = mode === "edit";

  const {
    data: issueData,
    isLoading: issueLoading,
    error: issueError,
  } = useAdminQuery(`issues/${issueId}`, {
    params: { select: ISSUE_SELECT },
    enabled: isEdit && Boolean(issueId),
  });

  if (isEdit && issueLoading) {
    return <p className={`${styles.status} caption gray-65`}>이슈 불러오는 중…</p>;
  }

  if (isEdit && issueError) {
    return (
      <p className={`${styles.error} caption`}>
        이슈를 불러오지 못했습니다: {issueError.message}
      </p>
    );
  }

  if (isEdit && !issueData) {
    return null;
  }

  const initialValues = isEdit ? issueToForm(issueData) : emptyForm();
  const initialDescription = isEdit ? parseDescription(issueData.description) : null;
  const formKey = isEdit ? issueId : "new";

  return (
    <IssueFormFields
      key={formKey}
      mode={mode}
      issueId={issueId}
      initialValues={initialValues}
      initialDescription={initialDescription}
    />
  );
}
