export const ADMIN_POST_PREVIEW_STORAGE_KEY = "crit-admin-post-preview";

export function writePostPreviewRecord(record) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ADMIN_POST_PREVIEW_STORAGE_KEY,
    JSON.stringify(record),
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

export function mergePostIntoIssuePosts(
  issuePosts,
  { postId, title, slug },
) {
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
    (post) => post.id === postId || post.id === previewId,
  );

  if (existingIndex >= 0) {
    return issuePosts.map((post, index) =>
      index === existingIndex ? previewPost : post,
    );
  }

  return [...issuePosts, previewPost];
}

export function buildPostPreviewRecord({
  form,
  content,
  author,
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
    slug: form.slug,
    date: form.date,
    thumnail_img: form.thumnail_img,
    video_url: form.video_url,
    content,
    author: author?.name
      ? { id: author.id ?? null, name: author.name }
      : null,
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
  previousIssues = [],
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
    previousIssues,
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
    previousIssues: record.previousIssues ?? [],
  };
}

export function mapPostPreviewRecordToPostView(record) {
  if (!record || (record.kind && record.kind !== "post")) {
    return null;
  }

  const post = {
    id: record.postId ?? "preview",
    title: record.title ?? "",
    subtitle: record.subtitle ?? "",
    slug: record.slug ?? "",
    thumbnailImg: record.thumnail_img ?? "",
    date: record.date ?? null,
    content: record.content ?? null,
    videoUrl: record.video_url ?? "",
    author: record.author ?? null,
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
