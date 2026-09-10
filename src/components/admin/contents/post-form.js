"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
  getSectionMode,
  sectionHasCategories,
  sectionHasMediaFields,
} from "@/lib/admin/section-mode";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import { findOrCreateAuthor } from "@/lib/authors/findOrCreateAuthor";
import { syncPostKeywords } from "@/lib/keywords/syncPostKeywords";
import EditorClient from "@/components/admin/shared/editor/EditorClient";
import { AuthorInput } from "@/components/admin/shared/author/AuthorInput";
import { KeywordInput } from "@/components/admin/shared/keyword/KeywordInput";
import styles from "@/components/admin/shared/post-form.module.css";

const POST_SELECT =
  "id,title,subtitle,slug,content,section_id,category_id,issue_id,author_id,authors(id,name),date,thumnail_img,video_url,workshop_url,start_at,end_at";

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

function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function emptyForm(defaults = {}) {
  return {
    title: "",
    subtitle: "",
    slug: "",
    section_id: defaults.sectionId ?? "",
    category_id: defaults.categoryId ?? "",
    issue_id: defaults.issueId ?? "",
    date: "",
    thumnail_img: "",
    video_url: "",
    workshop_url: "",
    start_at: "",
    end_at: "",
  };
}

function mapPostAuthor(post) {
  const author = post.authors;
  if (!author?.name) {
    return null;
  }

  return {
    id: author.id ?? null,
    name: author.name,
  };
}

function mapPostKeywords(items) {
  return (items ?? [])
    .map((item) => {
      const keyword = item.keywords;
      if (!keyword?.name) {
        return null;
      }

      return {
        id: keyword.id,
        name: keyword.name,
      };
    })
    .filter(Boolean);
}

function postToForm(post) {
  return {
    title: post.title ?? "",
    subtitle: post.subtitle ?? "",
    slug: post.slug ?? "",
    section_id: post.section_id ?? "",
    category_id: post.category_id ?? "",
    issue_id: post.issue_id ?? "",
    date: post.date ?? "",
    thumnail_img: post.thumnail_img ?? "",
    video_url: post.video_url ?? "",
    workshop_url: post.workshop_url ?? "",
    start_at: toDatetimeLocalValue(post.start_at),
    end_at: toDatetimeLocalValue(post.end_at),
  };
}

function PostFormFields({
  mode,
  postId,
  initialValues,
  initialContent,
  initialKeywords,
  initialAuthor,
  section,
  sectionMode,
  categories,
  issues,
}) {
  const router = useRouter();
  const editorRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const isEdit = mode === "edit";
  const isWorkshop = sectionMode === "workshop";

  const { mutate: createPost, isLoading: isCreating, error: createError } = useApiMutation("POST");
  const { mutate: updatePost, isLoading: isUpdating, error: updateError } = useApiMutation("PATCH");
  const { mutate: deletePost, isLoading: isDeleting, error: deleteError } = useApiMutation("DELETE");
  const { uploadImageToServer } = useImageUpload();

  const [form, setForm] = useState(initialValues);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [author, setAuthor] = useState(initialAuthor);
  const [editorError, setEditorError] = useState(null);
  const [keywordError, setKeywordError] = useState(null);
  const [authorError, setAuthorError] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleThumbnailUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setThumbnailError(null);
    setIsUploadingThumbnail(true);

    try {
      const result = await uploadImageToServer(file);

      if (result.success && result.file?.url) {
        updateField("thumnail_img", result.file.url);
        return;
      }

      setThumbnailError(result.error ?? "썸네일 업로드에 실패했습니다.");
    } catch (error) {
      setThumbnailError(error.message ?? "썸네일 업로드에 실패했습니다.");
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setEditorError(null);
    setKeywordError(null);
    setAuthorError(null);

    let content = null;
    let authorId = null;

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

    try {
      if (author?.name?.trim()) {
        authorId = await findOrCreateAuthor(author.name);
      }
    } catch (error) {
      setAuthorError(error.message ?? "작가를 저장하지 못했습니다.");
      return;
    }

    const payload = {
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      slug: form.slug.trim() || null,
      content,
      section_id: form.section_id || null,
      category_id: form.category_id || null,
      issue_id: form.issue_id || null,
      author_id: authorId,
      date: form.date || null,
      thumnail_img: form.thumnail_img.trim() || null,
      video_url: form.video_url.trim() || null,
      workshop_url: form.workshop_url.trim() || null,
      start_at: fromDatetimeLocalValue(form.start_at),
      end_at: fromDatetimeLocalValue(form.end_at),
      ...(isEdit ? {} : { is_active: false }),
    };

    try {
      const keywordNames = keywords.map((keyword) => keyword.name);
      let savedPostId = postId;

      if (isEdit) {
        await updatePost(`posts/${postId}`, payload);
      } else {
        const created = await createPost("posts", payload);
        savedPostId = created.id;
      }

      try {
        await syncPostKeywords(savedPostId, keywordNames);
      } catch (error) {
        setKeywordError(error.message ?? "키워드를 저장하지 못했습니다.");
        return;
      }

      router.push("/admin/contents");
    } catch {
      // mutation error state handles display
    }
  }

  async function handleDelete() {
    if (!isEdit || !postId) {
      return;
    }

    const label = form.title.trim() || "이 게시물";
    if (!window.confirm(`${label}을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await deletePost(`posts/${postId}`);
      router.push("/admin/contents");
    } catch {
      // mutation error state handles display
    }
  }

  const isSaving = isCreating || isUpdating || isDeleting;
  const submitError = createError ?? updateError ?? deleteError;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      {section && (
        <p className="p-bold black">
          대분류: <span className="p-bold crit-orange">{section.name} {section.slug}</span>
        </p>
      )}

      {(sectionHasCategories(sectionMode) || sectionMode === "journal") && (
        <div className={styles.section}>
          <h2 className={`${styles.sectionTitle} p-bold`}>분류</h2>

          {sectionHasCategories(sectionMode) && (
            <label className={styles.field}>
              <span className="caption">카테고리</span>
              <select
                className={styles.select}
                value={form.category_id}
                onChange={(event) => updateField("category_id", event.target.value)}
              >
                <option value="">선택 안 함</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name ?? category.slug}
                  </option>
                ))}
              </select>
            </label>
          )}

          {sectionMode === "journal" && (
            <label className={styles.field}>
              <span className="caption">Issue</span>
              <select
                className={styles.select}
                value={form.issue_id}
                onChange={(event) => updateField("issue_id", event.target.value)}
              >
                <option value="">선택 안 함</option>
                {issues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.issue_number ? `Vol. ${issue.issue_number}` : ""}
                    {issue.title ? ` — ${issue.title}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} p-bold`}>기본 정보</h2>


        <label className={styles.field}>
          <span className="caption">제목</span>
          <input
            className={styles.input}
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className="caption">영문 제목</span>
          <span className="caption gray-65">(영문 제목은 주소창의 URL에 사용됩니다.)</span>
          <input
            className={styles.input}
            type="text"
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className="caption">부제목</span>
          <input
            className={styles.input}
            type="text"
            value={form.subtitle}
            onChange={(event) => updateField("subtitle", event.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className="caption">작성자</span>
          <AuthorInput
            value={author}
            onChange={setAuthor}
            disabled={isSaving}
          />
          {authorError && (
            <p className={`${styles.error} caption`}>{authorError}</p>
          )}
        </div>

        <label className={styles.field}>
          <span className="caption">날짜</span>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
          />
        </label>

        {isWorkshop && (
          <>
            <label className={styles.field}>
              <span className="caption">모집 시작일</span>
              <input
                className={styles.input}
                type="datetime-local"
                value={form.start_at}
                onChange={(event) => updateField("start_at", event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className="caption">모집 종료일</span>
              <input
                className={styles.input}
                type="datetime-local"
                value={form.end_at}
                onChange={(event) => updateField("end_at", event.target.value)}
              />
            </label>
          </>
        )}

        <div className={styles.field}>
          <span className="caption">키워드</span>
          <KeywordInput
            value={keywords}
            onChange={setKeywords}
            disabled={isSaving}
          />
          {keywordError && (
            <p className={`${styles.error} caption`}>{keywordError}</p>
          )}
        </div>

        <div className={styles.field}>
          <span className="caption">대표 이미지</span>
          <input
            ref={thumbnailInputRef}
            className={styles.hiddenFileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleThumbnailUpload}
          />
          <button
            type="button"
            className={`${styles.thumbnailButton} caption`}
            onClick={() => thumbnailInputRef.current?.click()}
            disabled={isUploadingThumbnail || isSaving}
          >
            {isUploadingThumbnail
              ? "업로드 중…"
              : form.thumnail_img
                ? "이미지 변경"
                : "이미지 추가"}
          </button>
          {form.thumnail_img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.thumnail_img}
              alt="썸네일 미리보기"
              className={styles.thumbnailPreview}
            />
          ) : null}
          {thumbnailError && (
            <p className={`${styles.error} caption`}>{thumbnailError}</p>
          )}
        </div>
      </div>

      {sectionHasMediaFields(sectionMode) && (
        <div className={styles.section}>
          <h2 className={`${styles.sectionTitle} p-bold`}>미디어 · 링크</h2>

          {!isWorkshop && (
            <label className={styles.field}>
              <span className="caption">유튜브 링크</span>
              <input
                className={styles.input}
                type="url"
                value={form.video_url}
                onChange={(event) => updateField("video_url", event.target.value)}
              />
            </label>
          )}

          {isWorkshop && (
            <>
              <label className={styles.field}>
                <span className="caption">신청 폼 링크</span>
                <input
                  className={styles.input}
                  type="url"
                  value={form.workshop_url}
                  onChange={(event) => updateField("workshop_url", event.target.value)}
                />
              </label>
            </>
          )}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} p-bold`}>콘텐츠</h2>

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
            {isSaving && !isDeleting ? "저장 중…" : isEdit ? "수정 저장" : "생성"}
          </button>
          <Link href="/admin/contents" className={`${styles.cancelButton} caption`}>
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

export function PostForm({ mode, postId, sectionId, defaultCategoryId, defaultIssueId }) {
  const isEdit = mode === "edit";

  const {
    data: postData,
    isLoading: postLoading,
    error: postError,
  } = useAdminQuery(`posts/${postId}`, {
    params: { select: POST_SELECT },
    enabled: isEdit && Boolean(postId),
  });

  const effectiveSectionId = isEdit ? (postData?.section_id ?? "") : sectionId;

  const { data: sectionsData, isLoading: sectionsLoading } = useAdminQuery("sections", {
    params: {
      order: "sort_order.asc",
      limit: 20,
    },
  });

  const sections = sectionsData?.items ?? [];
  const section = sections.find((item) => item.id === effectiveSectionId) ?? null;
  const sectionMode = getSectionMode(section);

  const { data: categoriesData, isLoading: categoriesLoading } = useAdminQuery("categories", {
    params: {
      "eq.section_id": effectiveSectionId,
      select: "id,name,slug,sort_order",
      order: "sort_order.asc",
      limit: 100,
    },
    enabled: Boolean(effectiveSectionId) && sectionHasCategories(sectionMode),
  });

  const { data: issuesData, isLoading: issuesLoading } = useAdminQuery("issues", {
    params: {
      select: "id,title,issue_number",
      order: "issue_number.desc",
      limit: 100,
    },
    enabled: sectionMode === "journal",
  });

  const { data: postKeywordsData, isLoading: postKeywordsLoading } = useAdminQuery(
    "post_keywords",
    {
      params: {
        "eq.post_id": postId,
        select: "keyword_id,keywords(id,name)",
        limit: 50,
      },
      enabled: isEdit && Boolean(postId),
    }
  );

  const categories = categoriesData?.items ?? [];
  const issues = issuesData?.items ?? [];

  const isLoadingMeta =
    sectionsLoading ||
    (isEdit && postKeywordsLoading) ||
    (sectionHasCategories(sectionMode) && categoriesLoading) ||
    (sectionMode === "journal" && issuesLoading);

  if (isEdit && postLoading) {
    return <p className={`${styles.status} caption gray-65`}>게시물 불러오는 중…</p>;
  }

  if (isEdit && postError) {
    return (
      <p className={`${styles.error} caption`}>
        게시물을 불러오지 못했습니다: {postError.message}
      </p>
    );
  }

  if (isEdit && !postData) {
    return null;
  }

  if (isLoadingMeta) {
    return <p className={`${styles.status} caption gray-65`}>폼 준비 중…</p>;
  }

  const initialValues = isEdit
    ? postToForm(postData)
    : emptyForm({
      sectionId,
      categoryId: defaultCategoryId,
      issueId: defaultIssueId,
    });

  const initialContent = isEdit
    ? parseContent(postData.content)
    : null;

  const initialKeywords = isEdit
    ? mapPostKeywords(postKeywordsData?.items)
    : [];

  const initialAuthor = isEdit ? mapPostAuthor(postData) : null;

  const formKey = isEdit
    ? postId
    : `${sectionId}-${defaultCategoryId ?? ""}-${defaultIssueId ?? ""}`;

  return (
    <PostFormFields
      key={formKey}
      mode={mode}
      postId={postId}
      initialValues={initialValues}
      initialContent={initialContent}
      initialKeywords={initialKeywords}
      initialAuthor={initialAuthor}
      section={section}
      sectionMode={sectionMode}
      categories={categories}
      issues={issues}
    />
  );
}
