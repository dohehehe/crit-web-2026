export function toAbsoluteUrl(value, origin) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const base = String(origin ?? "").replace(/\/$/, "");

  if (!base) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

export function toAbsolutePath(path, origin) {
  if (!path) {
    return String(origin ?? "").replace(/\/$/, "") || null;
  }

  return toAbsoluteUrl(path, origin);
}
