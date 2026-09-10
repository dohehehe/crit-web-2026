export function sortPostsByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    const hasDateA = Boolean(a.date);
    const hasDateB = Boolean(b.date);

    if (!hasDateA && !hasDateB) {
      return 0;
    }

    if (!hasDateA) {
      return -1;
    }

    if (!hasDateB) {
      return 1;
    }

    return b.date.localeCompare(a.date);
  });
}
