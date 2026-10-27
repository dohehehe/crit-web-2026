import { getThumbnailUrl } from "@/lib/posts/thumbnail";

function normalizeAuthors(post) {
  return (post.post_author ?? [])
    .map((row) => row.authors)
    .filter((author) => author?.name);
}

export function normalizePost(post) {
  const keywords = (post.post_keywords ?? [])
    .map((row) => row.keywords)
    .filter(Boolean);
  const authors = normalizeAuthors(post);

  return {
    id: post.id,
    title: post.title ?? "",
    slug: post.slug ?? "",
    description: post.description ?? "",
    thumbnailImg: getThumbnailUrl(post.thumnail_img) ?? "",
    date: post.date ?? null,
    startAt: post.start_at ?? null,
    endAt: post.end_at ?? null,
    category: post.categories ?? null,
    section: post.sections ?? null,
    issueNumber: post.issues?.issue_number ?? "",
    author: authors[0] ?? null,
    authors,
    keywords,
  };
}

export function normalizePosts(posts) {
  return (posts ?? []).map(normalizePost);
}

export function normalizePostDetail(post) {
  if (!post) {
    return null;
  }

  return {
    ...normalizePost(post),
    subtitle: post.subtitle ?? "",
    description: post.description ?? "",
    content: post.content ?? null,
    videoUrl: post.video_url ?? "",
  };
}
