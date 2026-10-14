import { notFound } from "next/navigation";
import { AuthorProfileView } from "@/components/authors/AuthorProfileView";
import { getAuthorById, getPostsByAuthorId } from "@/lib/authors/getAuthors";
import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { resolveAuthorShareImage } from "@/lib/seo/resolveShareImage";
import { truncatePlainText } from "@/lib/text/truncatePlainText";
import styles from "./page.module.css";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const author = await getAuthorById(id);

  if (!author?.name) {
    return {};
  }

  const description = truncatePlainText(
    getEditorParagraphPlainText(author.content)
  );

  return buildPageMetadata({
    title: author.name,
    description,
    path: `/authors/${author.id}`,
    image: resolveAuthorShareImage(author),
  });
}

export default async function AuthorPage({ params }) {
  const { id } = await params;
  const author = await getAuthorById(id);

  if (!author) {
    notFound();
  }

  const posts = await getPostsByAuthorId(id);

  return (
    <main className={styles.main}>
      <AuthorProfileView author={author} posts={posts} />
    </main>
  );
}
