export const AUTHORS_TAB_ID = "authors";

export const AUTHORS_TAB = {
  id: AUTHORS_TAB_ID,
  name: "저자",
};

export function isAuthorsTabSelected(selectedId) {
  return selectedId === AUTHORS_TAB_ID;
}

function readRelationCount(countData) {
  if (Array.isArray(countData) && countData.length > 0) {
    return countData[0].count ?? 0;
  }

  return 0;
}

export function getAuthorPostCount(author) {
  return (
    readRelationCount(author.post_author) +
    readRelationCount(author.post_contributor)
  );
}

export function buildAuthorEditHref(authorId) {
  return `/admin/contents/authors/${authorId}`;
}
