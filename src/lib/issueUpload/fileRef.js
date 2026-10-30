import { ISSUE_FILE_BUCKET } from "./constants";

const ISSUE_STORAGE_PATH = /^issue\/[A-Za-z0-9._-]+\.pdf$/;

function storagePathFromUrl(value) {
  const markers = [
    `/storage/v1/object/public/${ISSUE_FILE_BUCKET}/`,
    `/storage/v1/object/sign/${ISSUE_FILE_BUCKET}/`,
    `/storage/v1/object/authenticated/${ISSUE_FILE_BUCKET}/`,
    `/api/issue-file?path=`,
  ];

  for (const marker of markers) {
    const index = value.indexOf(marker);

    if (index === -1) {
      continue;
    }

    const rawPath = value.slice(index + marker.length).split(/[?&#]/)[0];

    try {
      return decodeURIComponent(rawPath);
    } catch {
      return rawPath;
    }
  }

  return null;
}

export function parseIssueStoragePath(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const path = ISSUE_STORAGE_PATH.test(trimmed)
    ? trimmed
    : storagePathFromUrl(trimmed);

  if (!path || !ISSUE_STORAGE_PATH.test(path)) {
    return null;
  }

  return path;
}

export function issueFileName(value) {
  const path = parseIssueStoragePath(value) ?? value;

  if (!path) {
    return "";
  }

  try {
    const pathname = path.startsWith("issue/") ? path : new URL(path).pathname;
    const name = decodeURIComponent(pathname.split("/").pop() ?? "");
    return name || path;
  } catch {
    return path.split("/").pop() || path;
  }
}
