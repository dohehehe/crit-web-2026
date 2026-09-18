export const AUTHORS_TAB_ID = "authors";

export const AUTHORS_TAB = {
  id: AUTHORS_TAB_ID,
  name: "Authors",
};

export function isAuthorsTabSelected(selectedId) {
  return selectedId === AUTHORS_TAB_ID;
}

export function getAuthorPostCount(author) {
  const countData = author.posts;

  if (Array.isArray(countData) && countData.length > 0) {
    return countData[0].count ?? 0;
  }

  return 0;
}

export function buildAuthorEditHref(authorId) {
  return `/admin/contents/authors/${authorId}`;
}
