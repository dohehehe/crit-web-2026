import { extractContentImageUrl } from "@/lib/seo/extractContentImageUrl";
import {
  getYoutubeThumbnailUrl,
  getYoutubeVideoId,
} from "@/lib/youtube/getYoutubeEmbedUrl";

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function resolvePostShareImage(post) {
  const direct = firstNonEmpty(post?.thumbnailImg, post?.thumnail_img);

  if (direct) {
    return direct;
  }

  const videoId = getYoutubeVideoId(post?.videoUrl ?? post?.video_url);

  if (videoId) {
    return getYoutubeThumbnailUrl(videoId, "hq");
  }

  return extractContentImageUrl(post?.content);
}

export function resolveAuthorShareImage(author) {
  return (
    firstNonEmpty(author?.imgUrl, author?.img_url) ??
    extractContentImageUrl(author?.content)
  );
}

export function resolveIssueShareImage(issue) {
  return (
    firstNonEmpty(issue?.coverImg, issue?.cover_img) ??
    extractContentImageUrl(issue?.contents ?? issue?.description)
  );
}

export function resolveNoticeShareImage(notice) {
  return extractContentImageUrl(notice?.content);
}
