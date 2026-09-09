export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path, params) {
  const url = path.startsWith("/") ? path : `/api/${path}`;
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

export async function apiFetch(path, { method = "GET", body, params } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    throw new ApiError(
      payload.error ?? "Request failed",
      response.status,
      payload.details ?? null
    );
  }

  return payload.data;
}

export const api = {
  get: (path, params) => apiFetch(path, { method: "GET", params }),
  post: (path, body) => apiFetch(path, { method: "POST", body }),
  patch: (path, body) => apiFetch(path, { method: "PATCH", body }),
  delete: (path) => apiFetch(path, { method: "DELETE" }),
};
