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
    author: post.authors?.name
      ? { id: post.authors.id, name: post.authors.name }
      : null,
  };
}

function mapOtherIssueForPreview(issue) {
  return {
    id: issue.id,
    title: issue.title ?? "",
    issueNumber: issue.issue_number ?? "",
  };
}

function compareIssueNumberDesc(a, b) {
  const aNum = parseIssueNumber(a.issueNumber);
  const bNum = parseIssueNumber(b.issueNumber);

  if (aNum === null && bNum === null) {
    return 0;
  }

  if (aNum === null) {
    return 1;
  }

  if (bNum === null) {
    return -1;
  }

  return bNum - aNum;
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
          select: "id,title,slug,sort_order,authors!author_id(id,name)",
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

  const otherIssues = (issuesData?.items ?? [])
    .filter((issue) => {
      if (issueId && issue.id === issueId) {
        return false;
      }

      if (current === null) {
        return true;
      }

      return parseIssueNumber(issue.issue_number) !== current;
    })
    .map(mapOtherIssueForPreview)
    .sort(compareIssueNumberDesc);

  return { posts, otherIssues };
}
