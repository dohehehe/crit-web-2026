"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getSectionMode } from "@/lib/admin/section-mode";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import EditorClient from "./EditorClient";
import styles from "./post-form.module.css";

const POST_SELECT =
  "id,title,subtitle,slug,content,section_id,category_id,issue_id,author_id,date,thumnail_img,video_url,workshop_url,start_at,end_at";

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
    author_id: "",
    date: "",
    thumnail_img: "",
    video_url: "",
    workshop_url: "",
    start_at: "",
    end_at: "",
  };
}

function postToForm(post) {
  return {
    title: post.title ?? "",
    subtitle: post.subtitle ?? "",
    slug: post.slug ?? "",
    section_id: post.section_id ?? "",
    category_id: post.category_id ?? "",
    issue_id: post.issue_id ?? "",
    author_id: post.author_id ?? "",
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
  section,
  sectionMode,
  categories,
  issues,
  authors,
}) {
  const router = useRouter();
  const editorRef = useRef(null);
  const isEdit = mode === "edit";
  const isWorkshop = section?.slug === "Workshop";

  const { mutate: createPost, isLoading: isCreating, error: createError } = useApiMutation("POST");
  const { mutate: updatePost, isLoading: isUpdating, error: updateError } = useApiMutation("PATCH");

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
      subtitle: form.subtitle.trim() || null,
      slug: form.slug.trim() || null,
      content,
      section_id: form.section_id || null,
      category_id: form.category_id || null,
      issue_id: form.issue_id || null,
      author_id: form.author_id || null,
      date: form.date || null,
      thumnail_img: form.thumnail_img.trim() || null,
      video_url: form.video_url.trim() || null,
      workshop_url: form.workshop_url.trim() || null,
      start_at: fromDatetimeLocalValue(form.start_at),
      end_at: fromDatetimeLocalValue(form.end_at),
      ...(isEdit ? {} : { is_active: false }),
    };

    try {
      if (isEdit) {
        await updatePost(`posts/${postId}`, payload);
        router.push("/admin");
        return;
      }

      const created = await createPost("posts", payload);
      router.push(`/admin/posts/${created.id}`);
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

        {section && (
          <p className="caption gray-65">
            섹션: <span className="p-bold black">{section.name || section.slug}</span>
          </p>
        )}

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
          <span className="caption">Subtitle</span>
          <input
            className={styles.input}
            type="text"
            value={form.subtitle}
            onChange={(event) => updateField("subtitle", event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className="caption">English Title</span>
          <input
            className={styles.input}
            type="text"
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className="caption">Author</span>
          <select
            className={styles.select}
            value={form.author_id}
            onChange={(event) => updateField("author_id", event.target.value)}
          >
            <option value="">선택 안 함</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name ?? author.id}
              </option>
            ))}
          </select>
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

      </div>

      {(sectionMode === "current" || sectionMode === "journal") && (
        <div className={styles.section}>
          <h2 className={`${styles.sectionTitle} p-bold`}>분류</h2>

          {sectionMode === "current" && (
            <label className={styles.field}>
              <span className="caption">Category</span>
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
        <h2 className={`${styles.sectionTitle} p-bold`}>콘텐츠</h2>

        <div className={styles.field}>
          <span className="caption">Content</span>
          <EditorClient ref={editorRef} data={initialContent} />
          {editorError && (
            <p className={`${styles.error} caption`}>{editorError}</p>
          )}
        </div>

        <label className={styles.field}>
          <span className="caption">Thumbnail URL</span>
          <input
            className={styles.input}
            type="url"
            value={form.thumnail_img}
            onChange={(event) => updateField("thumnail_img", event.target.value)}
          />
        </label>
      </div>

      {sectionMode === "posts" && (
        <div className={styles.section}>
          <h2 className={`${styles.sectionTitle} p-bold`}>미디어 · 링크</h2>

          <label className={styles.field}>
            <span className="caption">Video URL</span>
            <input
              className={styles.input}
              type="url"
              value={form.video_url}
              onChange={(event) => updateField("video_url", event.target.value)}
            />
          </label>

          {isWorkshop && (
            <>
              <label className={styles.field}>
                <span className="caption">Workshop URL</span>
                <input
                  className={styles.input}
                  type="url"
                  value={form.workshop_url}
                  onChange={(event) => updateField("workshop_url", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className="caption">Start</span>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={form.start_at}
                  onChange={(event) => updateField("start_at", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className="caption">End</span>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={form.end_at}
                  onChange={(event) => updateField("end_at", event.target.value)}
                />
              </label>
            </>
          )}
        </div>
      )}

      {submitError && (
        <p className={`${styles.error} caption`}>저장하지 못했습니다: {submitError.message}</p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={`${styles.submitButton} caption`} disabled={isSaving}>
          {isSaving ? "저장 중…" : isEdit ? "수정 저장" : "생성"}
        </button>
        <Link href="/admin" className={`${styles.cancelButton} caption`}>
          취소
        </Link>
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
    enabled: Boolean(effectiveSectionId) && sectionMode === "current",
  });

  const { data: issuesData, isLoading: issuesLoading } = useAdminQuery("issues", {
    params: {
      select: "id,title,issue_number",
      order: "issue_number.desc",
      limit: 100,
    },
    enabled: sectionMode === "journal",
  });

  const { data: authorsData, isLoading: authorsLoading } = useAdminQuery("authors", {
    params: {
      select: "id,name",
      order: "name.asc",
      limit: 200,
    },
  });

  const categories = categoriesData?.items ?? [];
  const issues = issuesData?.items ?? [];
  const authors = authorsData?.items ?? [];

  const isLoadingMeta =
    sectionsLoading ||
    authorsLoading ||
    (sectionMode === "current" && categoriesLoading) ||
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
      section={section}
      sectionMode={sectionMode}
      categories={categories}
      issues={issues}
      authors={authors}
    />
  );
}
