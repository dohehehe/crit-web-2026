import { slugifyKeyword } from "@/lib/keywords/slugify";

const LATIN_LETTER = /[A-Za-z]/;

export function getAuthorDisplayName(author, locale = "ko") {
  const name = author?.name ?? "";
  const slug = author?.slug?.trim() ?? "";

  if (locale !== "en" || !slug || !LATIN_LETTER.test(slug)) {
    return name;
  }

  if (slug.toLowerCase() === slugifyKeyword(name)) {
    return name;
  }

  return slug;
}

export function getPostAuthors(post) {
  const listed = (post?.authors ?? []).filter((author) => author?.name);
  if (listed.length > 0) {
    return listed;
  }

  if (post?.author?.name) {
    return [post.author];
  }

  return [];
}

export function formatAuthorNames(post, locale = "ko") {
  return getPostAuthors(post)
    .map((author) => getAuthorDisplayName(author, locale))
    .join(", ");
}
