import { ISSUE_FILE_BUCKET, ISSUE_FILE_FOLDER } from "./constants";

function isSafePdfFileName(name) {
  if (!name || name === "." || name === "..") {
    return false;
  }

  if (/[\\/\u0000-\u001f\u007f]/.test(name)) {
    return false;
  }

  return name.toLowerCase().endsWith(".pdf");
}

export function toIssueStoragePath(originalName) {
  if (!originalName || typeof originalName !== "string") {
    return null;
  }

  const base = originalName.split(/[/\\]/).pop()?.trim().normalize("NFC") ?? "";

  if (!isSafePdfFileName(base)) {
    return null;
  }

  return `${ISSUE_FILE_FOLDER}/${base}`;
}

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
  const path = trimmed.startsWith(`${ISSUE_FILE_FOLDER}/`)
    ? trimmed
    : storagePathFromUrl(trimmed);

  if (!path?.startsWith(`${ISSUE_FILE_FOLDER}/`)) {
    return null;
  }

  const name = path.slice(ISSUE_FILE_FOLDER.length + 1);

  if (name.includes("/") || !isSafePdfFileName(name)) {
    return null;
  }

  return `${ISSUE_FILE_FOLDER}/${name}`;
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
