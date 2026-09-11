export const JOURNAL_CRIT_PATH_PREFIX = "/journal-crit";

export function isJournalCritPath(pathname) {
  return pathname.startsWith(JOURNAL_CRIT_PATH_PREFIX);
}

export function isJournalCritPostPath(pathname) {
  if (!isJournalCritPath(pathname)) {
    return false;
  }

  const segments = pathname
    .slice(JOURNAL_CRIT_PATH_PREFIX.length)
    .split("/")
    .filter(Boolean);

  return segments.length >= 2;
}

export function getJournalCritIssuePath(issueNumber) {
  return `${JOURNAL_CRIT_PATH_PREFIX}/${issueNumber}`;
}

export function getJournalCritPostPath(issueNumber, postSlug) {
  return `${getJournalCritIssuePath(issueNumber)}/${postSlug}`;
}
