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
    keywords,
  };
}

export function normalizePosts(posts) {
  return (posts ?? []).map(normalizePost);
}
