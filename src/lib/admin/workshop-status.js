export const WORKSHOP_STATUS = {
  PREPARING: "preparing",
  RECRUITING: "recruiting",
  CLOSED: "closed",
};

export const WORKSHOP_STATUS_LABELS = {
  [WORKSHOP_STATUS.PREPARING]: "준비중",
  [WORKSHOP_STATUS.RECRUITING]: "모집중",
  [WORKSHOP_STATUS.CLOSED]: "마감",
};

export function getWorkshopStatus(post, now = new Date()) {
  const start = post.start_at ? new Date(post.start_at) : null;
  const end = post.end_at ? new Date(post.end_at) : null;
  const time = now.getTime();

  if (start && time < start.getTime()) {
    return WORKSHOP_STATUS.PREPARING;
  }

  if (end && time > end.getTime()) {
    return WORKSHOP_STATUS.CLOSED;
  }

  if (start && end && time >= start.getTime() && time <= end.getTime()) {
    return WORKSHOP_STATUS.RECRUITING;
  }

  if (start && !end && time >= start.getTime()) {
    return WORKSHOP_STATUS.RECRUITING;
  }

  if (!start && end && time <= end.getTime()) {
    return WORKSHOP_STATUS.RECRUITING;
  }

  return WORKSHOP_STATUS.PREPARING;
}

export function filterPostsByWorkshopStatus(posts, status, now = new Date()) {
  if (!status) {
    return posts;
  }

  return posts.filter((post) => getWorkshopStatus(post, now) === status);
}
