export function normalizeIssueSummary(issue) {
  if (!issue) {
    return null;
  }

  return {
    id: issue.id,
    title: issue.title ?? "",
    issueNumber: issue.issue_number ?? "",
  };
}

export function normalizeIssue(issue) {
  if (!issue) {
    return null;
  }

  return {
    id: issue.id,
    title: issue.title ?? "",
    slug: issue.slug ?? "",
    issueNumber: issue.issue_number ?? "",
    coverImg: issue.cover_img?.trim() ?? "",
    contents: issue.description ?? null,
    fileUrl: issue.file_url ?? "",
  };
}
