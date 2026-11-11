import "server-only";

const VERCEL_API_BASE = "https://api.vercel.com";
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

export const ANALYTICS_RANGES = [
  { id: "7", days: 7, label: "7일" },
  { id: "30", days: 30, label: "한 달" },
];

export function resolveAnalyticsRange(value) {
  return ANALYTICS_RANGES.find((range) => range.id === value) ?? ANALYTICS_RANGES[0];
}

function seoulToday() {
  return new Date(Date.now() + SEOUL_OFFSET_MS).toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function rangeWindow(days) {
  const until = seoulToday();
  const since = addDays(until, -(days - 1));
  return { since, until };
}

async function vercelGet(token, path, params) {
  const url = new URL(path, VERCEL_API_BASE);

  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error?.message;
    throw new Error(message || `Vercel API 요청에 실패했습니다. (${response.status})`);
  }

  return body;
}

async function resolveProject(token) {
  const body = await vercelGet(token, "/v9/projects", { limit: 100 });
  const projects = Array.isArray(body?.projects) ? body.projects : [];
  const wanted = process.env.VERCEL_PROJECT_ID?.trim();
  const project = wanted
    ? projects.find((item) => item.id === wanted || item.name === wanted)
    : projects.length === 1
      ? projects[0]
      : null;

  if (!project) {
    if (wanted) {
      throw new Error("VERCEL_PROJECT_ID에 해당하는 프로젝트를 찾지 못했습니다.");
    }

    if (projects.length === 0) {
      throw new Error("이 토큰으로 보이는 Vercel 프로젝트가 없습니다.");
    }

    throw new Error("프로젝트가 여러 개라 VERCEL_PROJECT_ID가 필요합니다.");
  }

  const accountId = typeof project.accountId === "string" ? project.accountId : "";
  const teamId = process.env.VERCEL_TEAM_ID?.trim() || (accountId.startsWith("team_") ? accountId : "");

  return {
    id: project.id,
    name: project.name,
    teamId,
  };
}

function metricRows(rows, labelKey, emptyLabel) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    label: row?.[labelKey] || emptyLabel,
    pageviews: Number(row?.pageviews) || 0,
    visitors: Number(row?.visitors) || 0,
  }));
}

export async function getVercelWebAnalytics(rangeDays) {
  const range = ANALYTICS_RANGES.find((item) => item.days === rangeDays) ?? ANALYTICS_RANGES[0];
  const window = rangeWindow(range.days);
  const token = process.env.VERCEL_ANALYTICS_TOKEN;

  if (!token) {
    return {
      ok: false,
      range,
      ...window,
      error: "VERCEL_ANALYTICS_TOKEN이 설정되어 있지 않습니다.",
    };
  }

  try {
    const project = await resolveProject(token);
    const query = {
      projectId: project.id,
      teamId: project.teamId,
      since: window.since,
      until: window.until,
    };
    const [totals, daily, paths, referrers] = await Promise.all([
      vercelGet(token, "/v1/query/web-analytics/visits/count", query),
      vercelGet(token, "/v1/query/web-analytics/visits/aggregate", {
        ...query,
        by: "day",
        limit: range.days,
      }),
      vercelGet(token, "/v1/query/web-analytics/visits/aggregate", {
        ...query,
        by: "requestPath",
        limit: 10,
      }),
      vercelGet(token, "/v1/query/web-analytics/visits/aggregate", {
        ...query,
        by: "referrerHostname",
        limit: 10,
      }),
    ]);

    return {
      ok: true,
      range,
      ...window,
      projectName: project.name,
      pageviews: Number(totals?.data?.pageviews) || 0,
      visitors: Number(totals?.data?.visitors) || 0,
      days: metricRows(daily?.data, "timestamp", "")
        .map((row) => ({
          ...row,
          label: row.label.slice(0, 10),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      paths: metricRows(paths?.data, "requestPath", "/"),
      referrers: metricRows(referrers?.data, "referrerHostname", "직접 방문"),
    };
  } catch (error) {
    return {
      ok: false,
      range,
      ...window,
      error: error instanceof Error ? error.message : "통계를 불러오지 못했습니다.",
    };
  }
}
