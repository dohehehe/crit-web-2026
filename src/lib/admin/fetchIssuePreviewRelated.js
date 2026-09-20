import { ADMIN_SCOPE } from "@/lib/api/constants";
import { apiFetch } from "@/lib/api/fetcher";

function parseIssueNumber(value) {
  const normalized = String(value ?? "").trim();
  const num = Number(normalized);

  return Number.isNaN(num) ? null : num;
}

function mapPostForPreview(post) {
  return {
    id: post.id,
    title: post.title ?? "",
    slug: post.slug ?? "",
  };
}

function mapPreviousIssueForPreview(issue) {
  return {
    id: issue.id,
    title: issue.title ?? "",
    issueNumber: issue.issue_number ?? "",
  };
}

export async function fetchIssuePostsForPreview(issueId) {
  if (!issueId) {
    return [];
  }

  const data = await apiFetch("posts", {
    params: {
      scope: ADMIN_SCOPE,
      "eq.issue_id": issueId,
      select: "id,title,slug,sort_order",
      order: "sort_order.asc",
      limit: 100,
    },
  });

  return (data?.items ?? []).map(mapPostForPreview);
}

export async function fetchIssueFileUrlForPreview(issueId) {
  if (!issueId) {
    return null;
  }

  const data = await apiFetch(`issues/${issueId}`, {
    params: {
      scope: ADMIN_SCOPE,
      select: "file_url",
    },
  });

  const url = data?.file_url?.trim();
  return url || null;
}

export async function fetchIssuePreviewRelated({ issueId, issueNumber }) {
  const adminParams = { scope: ADMIN_SCOPE };

  const postsPromise = issueId
    ? apiFetch("posts", {
        params: {
          ...adminParams,
          "eq.issue_id": issueId,
          select: "id,title,slug,sort_order",
          order: "sort_order.asc",
          limit: 100,
        },
      }).then((data) => (data?.items ?? []).map(mapPostForPreview))
    : Promise.resolve([]);

  const issuesPromise = apiFetch("issues", {
    params: {
      ...adminParams,
      select: "id,title,issue_number",
      order: "issue_number.desc",
      limit: 100,
    },
  });

  const [posts, issuesData] = await Promise.all([postsPromise, issuesPromise]);
  const current = parseIssueNumber(issueNumber);

  const previousIssues =
    current === null
      ? []
      : (issuesData?.items ?? [])
          .filter((issue) => {
            const num = parseIssueNumber(issue.issue_number);
            return num !== null && num < current;
          })
          .map(mapPreviousIssueForPreview);

  return { posts, previousIssues };
}
