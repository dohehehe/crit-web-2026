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

export function isJournalCritOrangeBackgroundPath(pathname) {
  return isJournalCritPath(pathname) && !isJournalCritPostPath(pathname);
}

export const JOURNAL_ISSUE_BACKGROUND_CLASS = "journalIssueBackground";
export const JOURNAL_MOBILE_HEADER_OFFSET_VAR = "--journal-mobile-header-offset";
export const MOBILE_BREAKPOINT_QUERY = "(max-width: 479px)";

export function getJournalCritIssuePath(issueNumber) {
  return `${JOURNAL_CRIT_PATH_PREFIX}/${issueNumber}`;
}

export function getJournalCritPostPath(issueNumber, postSlug) {
  return `${getJournalCritIssuePath(issueNumber)}/${postSlug}`;
}
