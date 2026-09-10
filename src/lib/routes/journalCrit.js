export const JOURNAL_CRIT_PATH_PREFIX = "/journal-crit";

export const BODY_JOURNAL_CRIT_CLASS = "bodyJournalCrit";

export function isJournalCritPath(pathname) {
  return pathname.startsWith(JOURNAL_CRIT_PATH_PREFIX);
}

export function getJournalCritIssuePath(issueNumber) {
  return `${JOURNAL_CRIT_PATH_PREFIX}/${issueNumber}`;
}

export function getJournalCritPostPath(issueNumber, postSlug) {
  return `${getJournalCritIssuePath(issueNumber)}/${postSlug}`;
}
