function buildEmbedUrl(videoId) {
  const id = String(videoId ?? "").trim();

  if (!id) {
    return null;
  }

  return `https://www.youtube.com/embed/${id}`;
}

export function getYoutubeEmbedUrl(url) {
  const trimmed = String(url ?? "").trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = parsed.pathname.slice(1).split("/")[0];
      return buildEmbedUrl(videoId);
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return buildEmbedUrl(parsed.searchParams.get("v"));
      }

      const pathMatch = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/);

      if (pathMatch) {
        return buildEmbedUrl(pathMatch[2]);
      }
    }
  } catch {
    return null;
  }

  return null;
}
