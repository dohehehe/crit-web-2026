export function getAuthorPath(author) {
  const id = typeof author === "string" ? author : author?.id;

  if (!id) {
    return "/";
  }

  return `/authors/${id}`;
}
