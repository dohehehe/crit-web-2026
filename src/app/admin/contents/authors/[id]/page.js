import Link from "next/link";
import { AuthorForm } from "@/components/admin/contents/author-form";
import { contentsSectionHref } from "@/lib/admin/admin-routes";
import { AUTHORS_TAB_ID } from "@/lib/admin/authors-tab";
import styles from "@/app/admin/contents/posts/post-page.module.css";

export const metadata = {
  title: "저자 수정",
};

export default async function EditAuthorPage({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href={contentsSectionHref(AUTHORS_TAB_ID)} className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">저자 수정</h1>
      </header>
      <AuthorForm authorId={id} />
    </main>
  );
}
