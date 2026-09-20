export function normalizeAuthor(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.id,
    name: author.name ?? "",
    slug: author.slug ?? "",
    email: author.email ?? "",
    imgUrl: author.img_url ?? "",
    content: author.content ?? null,
  };
}
