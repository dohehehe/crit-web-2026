export function normalizePost(post) {
  const keywords = (post.post_keywords ?? [])
    .map((row) => row.keywords)
    .filter(Boolean);

  return {
    id: post.id,
    title: post.title ?? "",
    slug: post.slug ?? "",
    thumbnailImg: post.thumnail_img ?? "",
    date: post.date ?? null,
    category: post.categories ?? null,
    section: post.sections ?? null,
    issueNumber: post.issues?.issue_number ?? "",
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
    content: post.content ?? null,
    author: post.authors ?? null,
    videoUrl: post.video_url ?? "",
  };
}
