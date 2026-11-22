import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getThumbnailUrl, parseThumbnail } from "@/lib/posts/thumbnail";

function normalizePeople(rows) {
  return (rows ?? [])
    .map((row) => row.authors)
    .filter((person) => person?.name)
    .map((person) => ({
      id: person.id ?? null,
      name: person.name,
      slug: person.slug ?? "",
      imgUrl: person.img_url ?? person.imgUrl ?? "",
      description: person.content
        ? getEditorParagraphPlainText(person.content)
        : person.description ?? "",
    }));
}

export function normalizePost(post) {
  const keywords = (post.post_keywords ?? [])
    .map((row) => row.keywords)
    .filter(Boolean);
  const authors = normalizePeople(post.post_author);
  const contributors = normalizePeople(post.post_contributor);

  return {
    id: post.id,
    title: post.title ?? "",
    slug: post.slug ?? "",
    description: post.description ?? "",
    thumbnailImg: getThumbnailUrl(post.thumnail_img) ?? "",
    thumbnailImgHover:
      typeof post.thumbnail_img_hover === "string"
        ? post.thumbnail_img_hover.trim()
        : "",
    date: post.date ?? null,
    startAt: post.start_at ?? null,
    endAt: post.end_at ?? null,
    category: post.categories ?? null,
    section: post.sections ?? null,
    issueNumber: post.issues?.issue_number ?? "",
    author: authors[0] ?? null,
    authors,
    contributors,
    keywords,
  };
}

export function normalizePosts(posts) {
  return (posts ?? []).map(normalizePost);
}

export function normalizePostDetail(post) {
  if (!post) {
    return null;
  }

  const thumbnail = parseThumbnail(post.thumnail_img);

  return {
    ...normalizePost(post),
    subtitle: post.subtitle ?? "",
    subtitleEn: post.subtitle_en ?? "",
    description: post.description ?? "",
    content: post.content ?? null,
    contentEn: post.content_en ?? null,
    videoUrl: post.video_url ?? "",
    thumbnailImg: thumbnail.url,
    thumbnailCaptionKr: thumbnail.captionKr,
    thumbnailCaptionEn: thumbnail.captionEn,
  };
}
