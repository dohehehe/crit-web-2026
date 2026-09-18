import { notFound } from "next/navigation";
import { AuthorProfileView } from "@/components/authors/AuthorProfileView";
import { getAuthorById, getPostsByAuthorId } from "@/lib/authors/getAuthors";
import styles from "./page.module.css";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const author = await getAuthorById(id);

  if (!author?.name) {
    return {};
  }

  return {
    title: author.name,
  };
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
