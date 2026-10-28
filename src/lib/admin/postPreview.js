import { parseThumbnail, serializeThumbnail } from "@/lib/posts/thumbnail";

export const ADMIN_POST_PREVIEW_STORAGE_KEY = "crit-admin-post-preview";

export function writePostPreviewRecord(record) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ADMIN_POST_PREVIEW_STORAGE_KEY,
    JSON.stringify(record)
  );
}

export function readPostPreviewRecord() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_POST_PREVIEW_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function mergePostIntoIssuePosts(issuePosts, { postId, title, slug }) {
  const previewId = postId ?? "preview";
  const previewPost = {
    id: previewId,
    title: title ?? "",
    slug: slug ?? "",
  };

  if (!title?.trim() && issuePosts.length === 0) {
    return [];
  }

  if (!title?.trim()) {
    return issuePosts;
  }

  const existingIndex = issuePosts.findIndex(
    (post) => post.id === postId || post.id === previewId
  );

  if (existingIndex >= 0) {
    return issuePosts.map((post, index) =>
      index === existingIndex ? previewPost : post
    );
  }

  return [...issuePosts, previewPost];
}

export function buildPostPreviewRecord({
  form,
  content,
  contentEn = null,
  authors = [],
  keywords,
  section,
  sectionMode,
  categories,
  issues,
  postId,
  issuePosts = [],
  issueFileUrl = null,
}) {
  const category =
    categories.find((item) => item.id === form.category_id) ?? null;
  const issue = issues.find((item) => item.id === form.issue_id) ?? null;

  return {
    version: 1,
    kind: "post",
    postId: postId ?? null,
    sectionMode,
    section: section
      ? { id: section.id, name: section.name, slug: section.slug }
      : null,
    title: form.title,
    subtitle: form.subtitle,
    subtitleEn: form.subtitle_en ?? "",
    slug: form.slug,
    description: form.description,
    date: form.date,
    thumnail_img: serializeThumbnail({
      url: form.thumnail_img,
      captionKr: form.thumbnail_caption_kr,
      captionEn: form.thumbnail_caption_en,
    }),
    video_url: form.video_url,
    content,
    contentEn,
    authors: authors
      .filter((author) => author?.name)
      .map((author) => ({ id: author.id ?? null, name: author.name })),
    keywords: keywords.map((keyword) => ({
      id: keyword.id ?? null,
      name: keyword.name,
    })),
    category: category
      ? { id: category.id, name: category.name ?? category.slug }
      : null,
    issue: issue
      ? {
          id: issue.id,
          issueNumber: issue.issue_number,
          title: issue.title,
          fileUrl: issueFileUrl,
        }
      : null,
    issuePosts: sectionMode === "journal" ? issuePosts : [],
  };
}

export function buildIssuePreviewRecord({
  form,
  contents,
  issueId,
  posts = [],
  otherIssues = [],
}) {
  return {
    version: 1,
    kind: "issue",
    issueId: issueId ?? null,
    title: form.title,
    issueNumber: form.issue_number,
    coverImg: form.cover_img,
    fileUrl: form.file_url,
    contents,
    posts,
    otherIssues,
  };
}

export function mapIssuePreviewRecordToJournalView(record) {
  if (!record || record.kind !== "issue") {
    return null;
  }

  return {
    issue: {
      id: record.issueId ?? "preview",
      title: record.title ?? "",
      issueNumber: record.issueNumber ?? "",
      coverImg: record.coverImg ?? "",
      fileUrl: record.fileUrl ?? "",
      contents: record.contents ?? null,
    },
    posts: record.posts ?? [],
    otherIssues: record.otherIssues ?? record.previousIssues ?? [],
  };
}

export function mapPostPreviewRecordToPostView(record) {
  if (!record || (record.kind && record.kind !== "post")) {
    return null;
  }

  const thumbnail = parseThumbnail(record.thumnail_img);
  const post = {
    id: record.postId ?? "preview",
    title: record.title ?? "",
    subtitle: record.subtitle ?? "",
    subtitleEn: record.subtitleEn ?? "",
    slug: record.slug ?? "",
    description: record.description ?? "",
    thumbnailImg: thumbnail.url,
    thumbnailCaptionKr: thumbnail.captionKr,
    thumbnailCaptionEn: thumbnail.captionEn,
    date: record.date ?? null,
    content: record.content ?? null,
    contentEn: record.contentEn ?? null,
    videoUrl: record.video_url ?? "",
    authors: Array.isArray(record.authors)
      ? record.authors.filter((author) => author?.name)
      : record.author?.name
        ? [record.author]
        : [],
    category: record.category ?? null,
    section: record.section ?? null,
    keywords: record.keywords ?? [],
  };

  const issue = record.issue
    ? {
        issueNumber: record.issue.issueNumber,
        fileUrl: record.issue.fileUrl ?? null,
      }
    : null;

  const issuePosts =
    record.sectionMode === "journal"
      ? mergePostIntoIssuePosts(record.issuePosts ?? [], {
          postId: record.postId,
          title: record.title,
          slug: record.slug,
        })
      : [];

  return {
    post,
    issue,
    issuePosts,
    sectionMode: record.sectionMode ?? null,
  };
}
