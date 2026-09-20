import { getAuthorPath } from "@/lib/routes/authors";
import { getPostPath } from "@/lib/routes/posts";

export function postToSearchEntry(post) {
  return {
    key: `post:${post.id}`,
    href: getPostPath(post),
    title: post.title ?? "",
    thumbnailImg: post.thumbnailImg ?? "",
    date: post.date ?? null,
    authorName: post.author?.name ?? "",
    section: post.section ?? null,
    category: post.category ?? null,
    keywords: post.keywords ?? [],
    showThumbnailPlaceholder: true,
  };
}

export function authorToSearchEntry(author) {
  return {
    key: `author:${author.id}`,
    href: getAuthorPath(author),
    title: author.name ?? "",
    thumbnailImg: author.imgUrl ?? "",
    date: null,
    authorName: "",
    section: null,
    category: null,
    keywords: [],
    showThumbnailPlaceholder: false,
  };
}

export function buildTextSearchEntries({ posts = [], authors = [] }) {
  return [...authors.map(authorToSearchEntry), ...posts.map(postToSearchEntry)];
}
