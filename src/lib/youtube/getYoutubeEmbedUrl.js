function buildEmbedUrl(videoId, options = {}) {
  const id = String(videoId ?? "").trim();

  if (!id) {
    return null;
  }

  const params = new URLSearchParams({
    color: "white",
    rel: "0",
    iv_load_policy: "3",
    cc_load_policy: "0",
    playsinline: "1",
  });

  if (options.autoplay) {
    params.set("autoplay", "1");
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function getYoutubeVideoId(url) {
  const trimmed = String(url ?? "").trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = parsed.pathname.slice(1).split("/")[0];
      return videoId || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v") || null;
      }

      const pathMatch = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/);

      if (pathMatch) {
        return pathMatch[2] || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYoutubeEmbedUrl(url, options = {}) {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return buildEmbedUrl(videoId, options);
}

export function getYoutubeThumbnailUrl(videoId, quality = "sd") {
  const id = String(videoId ?? "").trim();

  if (!id) {
    return null;
  }

  const files = {
    maxres: "maxresdefault",
    sd: "sddefault",
    hq: "hqdefault",
    mq: "mqdefault",
  };
  const file = files[quality] ?? files.sd;

  return `https://img.youtube.com/vi/${id}/${file}.jpg`;
}
