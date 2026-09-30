export function toPostPathSegment(value) {
  return String(value ?? "").trim().replace(/\s+/g, "-");
}

export function slugMatchPattern(value) {
  return toPostPathSegment(value)
    .replace(/[\\%_]/g, "\\$&")
    .replace(/-/g, "%");
}
