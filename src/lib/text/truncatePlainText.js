const DEFAULT_MAX_LENGTH = 160;

export function truncatePlainText(text, maxLength = DEFAULT_MAX_LENGTH) {
  const normalized = text?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}
