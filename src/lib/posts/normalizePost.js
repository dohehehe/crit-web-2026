import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getThumbnailUrl, parseThumbnail } from "@/lib/posts/thumbnail";

function normalizeAuthors(post) {
  return (post.post_author ?? [])
    .map((row) => row.authors)
    .filter((author) => author?.name)
    .map((author) => ({
      id: author.id ?? null,
      name: author.name,
      imgUrl: author.img_url ?? author.imgUrl ?? "",
      description: author.content
        ? getEditorParagraphPlainText(author.content)
        : author.description ?? "",
    }));
}

export function normalizePost(post) {
  const keywords = (post.post_keywords ?? [])
    .map((row) => row.keywords)
    .filter(Boolean);
  const authors = normalizeAuthors(post);

  return {
    id: post.id,
    title: post.title ?? "",
    slug: post.slug ?? "",
    description: post.description ?? "",
    thumbnailImg: getThumbnailUrl(post.thumnail_img) ?? "",
    date: post.date ?? null,
    startAt: post.start_at ?? null,
    endAt: post.end_at ?? null,
    category: post.categories ?? null,
    section: post.sections ?? null,
    issueNumber: post.issues?.issue_number ?? "",
    author: authors[0] ?? null,
    authors,
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
