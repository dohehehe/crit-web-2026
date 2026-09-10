export function sortPostsBySortOrder(posts) {
  return [...posts]
    .map((post, index) => ({ post, index }))
    .sort((a, b) => compareSortOrder(a.post, b.post, a.index, b.index))
    .map(({ post }) => post);
}

function compareSortOrder(postA, postB, indexA, indexB) {
  const orderA = normalizeSortOrder(postA.sort_order);
  const orderB = normalizeSortOrder(postB.sort_order);

  if (orderA != null && orderB != null && orderA !== orderB) {
    return orderA - orderB;
  }

  if (orderA != null && orderB == null) {
    return -1;
  }

  if (orderA == null && orderB != null) {
    return 1;
  }

  return indexA - indexB;
}

function normalizeSortOrder(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getPostSortOrderUpdates(posts, index, direction) {
  const sorted = sortPostsBySortOrder(posts);
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= sorted.length) {
    return null;
  }

  const withOrders = sorted.map((post, orderIndex) => ({
    id: post.id,
    sort_order: normalizeSortOrder(post.sort_order) ?? orderIndex * 10,
  }));

  const current = withOrders[index];
  const adjacent = withOrders[targetIndex];

  return [
    { id: current.id, sort_order: adjacent.sort_order },
    { id: adjacent.id, sort_order: current.sort_order },
  ];
}
