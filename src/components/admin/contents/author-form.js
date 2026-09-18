"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useImageUpload } from "@/hooks/useImageUpload";
import { getAuthorPostCount } from "@/lib/admin/authors-tab";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import { slugifyKeyword } from "@/lib/keywords/slugify";
import EditorClient from "@/components/admin/shared/editor/EditorClient";
import styles from "@/components/admin/shared/post-form.module.css";

const AUTHOR_SELECT = "id,name,slug,email,img_url,content,posts(count)";

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

function authorToForm(author) {
  return {
    name: author.name ?? "",
    slug: author.slug ?? "",
    email: author.email ?? "",
    img_url: author.img_url ?? "",
  };
}

function AuthorFormFields({ authorId, initialValues, initialContent, postCount }) {
  const router = useRouter();
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  const { mutate: updateAuthor, isLoading: isUpdating, error: updateError } =
    useApiMutation("PATCH");
  const { mutate: deleteAuthor, isLoading: isDeleting, error: deleteError } =
    useApiMutation("DELETE");
  const { uploadImageToServer } = useImageUpload();

  const [form, setForm] = useState(initialValues);
  const [slugTouched, setSlugTouched] = useState(true);
  const [editorError, setEditorError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  function updateField(name, value) {
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "name" && !slugTouched) {
        next.slug = slugifyKeyword(value);
      }

      return next;
    });
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError(null);
    setIsUploadingImage(true);

    try {
      const result = await uploadImageToServer(file);

      if (result.success && result.file?.url) {
        updateField("img_url", result.file.url);
        return;
      }

      setImageError(result.error ?? "이미지 업로드에 실패했습니다.");
    } catch (error) {
      setImageError(error.message ?? "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
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
      name: form.name.trim() || null,
      slug: form.slug.trim() || null,
      email: form.email.trim() || null,
      img_url: form.img_url.trim() || null,
      content,
    };

    try {
      await updateAuthor(`authors/${authorId}`, payload);
      router.push("/admin/contents");
    } catch {
      // mutation error state handles display
    }
  }

  async function handleDelete() {
    const label = form.name.trim() || form.slug.trim() || "이 저자";
    const message =
      postCount > 0
        ? `${label}을(를) 삭제할까요? ${postCount}개 게시물의 저자 연결이 해제됩니다.`
        : `${label}을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      await deleteAuthor(`authors/${authorId}`);
      router.push("/admin/contents");
    } catch {
      // mutation error state handles display
    }
  }

  const isSaving = isUpdating || isDeleting;
  const submitError = updateError ?? deleteError;

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
          <span className="caption">Email</span>
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className="caption">프로필 이미지</span>
          <input
            ref={imageInputRef}
            className={styles.hiddenFileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            className={`${styles.thumbnailButton} caption`}
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage || isSaving}
          >
            {isUploadingImage
              ? "업로드 중…"
              : form.img_url
                ? "이미지 변경"
                : "이미지 추가"}
          </button>
          {form.img_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.img_url}
              alt="프로필 미리보기"
              className={styles.thumbnailPreview}
            />
          ) : null}
          {imageError && <p className={`${styles.error} caption`}>{imageError}</p>}
        </div>
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
          <button type="submit" className={`${styles.submitButton} caption`} disabled={isSaving}>
            {isUpdating ? "저장 중…" : "수정 저장"}
          </button>
          <Link href="/admin/contents" className={`${styles.cancelButton} caption`}>
            취소
          </Link>
        </div>
        <button
          type="button"
          className={`${styles.deleteButton} caption`}
          onClick={handleDelete}
          disabled={isSaving}
        >
          {isDeleting ? "삭제 중…" : "삭제"}
        </button>
      </div>
    </form>
  );
}

export function AuthorForm({ authorId }) {
  const {
    data: authorData,
    isLoading: authorLoading,
    error: authorError,
  } = useAdminQuery(`authors/${authorId}`, {
    params: { select: AUTHOR_SELECT },
    enabled: Boolean(authorId),
  });

  if (authorLoading) {
    return <p className={`${styles.status} caption gray-65`}>저자 불러오는 중…</p>;
  }

  if (authorError) {
    return (
      <p className={`${styles.error} caption`}>
        저자를 불러오지 못했습니다: {authorError.message}
      </p>
    );
  }

  if (!authorData) {
    return null;
  }

  return (
    <AuthorFormFields
      key={authorId}
      authorId={authorId}
      initialValues={authorToForm(authorData)}
      initialContent={parseContent(authorData.content)}
      postCount={getAuthorPostCount(authorData)}
    />
  );
}
