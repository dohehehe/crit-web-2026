import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getAuthorPath } from "@/lib/routes/authors";
import { getPostPath } from "@/lib/routes/posts";
import { truncatePlainText } from "@/lib/text/truncatePlainText";

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
    excerpt: "",
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
    excerpt: truncatePlainText(getEditorParagraphPlainText(author.content)),
    showThumbnailPlaceholder: false,
  };
}

export function buildTextSearchEntries({ posts = [], authors = [] }) {
  return [...authors.map(authorToSearchEntry), ...posts.map(postToSearchEntry)];
}
