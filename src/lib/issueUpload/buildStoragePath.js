import { ISSUE_FILE_FOLDER } from "./constants";

export function buildIssueStoragePath() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${ISSUE_FILE_FOLDER}/${id}.pdf`;
}
