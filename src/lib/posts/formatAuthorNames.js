export function getPostAuthors(post) {
  const listed = (post?.authors ?? []).filter((author) => author?.name);
  if (listed.length > 0) {
    return listed;
  }

  if (post?.author?.name) {
    return [post.author];
  }

  return [];
}

export function formatAuthorNames(post) {
  return getPostAuthors(post)
    .map((author) => author.name)
    .join(", ");
}
