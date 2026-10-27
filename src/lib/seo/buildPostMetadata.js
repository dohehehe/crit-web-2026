import { getPostMetaDescription } from "@/lib/posts/getPostMetaDescription";
import { getPostAuthors } from "@/lib/posts/formatAuthorNames";
import { getPostPath } from "@/lib/routes/posts";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { resolvePostShareImage } from "@/lib/seo/resolveShareImage";

export async function buildPostMetadata({
  post,
  title,
  path,
  issueNumber,
} = {}) {
  if (!post) {
    return {};
  }

  const resolvedPath =
    path ?? getPostPath(post, issueNumber ? { issueNumber } : undefined);
  const description = getPostMetaDescription(post);
  const image = resolvePostShareImage(post);
  const keywords = (post.keywords ?? [])
    .map((keyword) => keyword?.name)
    .filter(Boolean);
  const authorNames = getPostAuthors(post).map((author) => author.name);
  const authors = authorNames.length > 0 ? authorNames : undefined;
  const publishedTime = post.date ? `${post.date}T00:00:00+09:00` : undefined;

  return buildPageMetadata({
    title,
    description,
    path: resolvedPath,
    image,
    type: "article",
    publishedTime,
    authors,
    keywords,
  });
}
