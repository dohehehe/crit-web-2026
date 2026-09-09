import Link from "next/link";
import { PostForm } from "@/components/admin/post-form";
import styles from "../post-page.module.css";

export const metadata = {
  title: "게시물 수정",
};

export default async function EditPostPage({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/contents" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">게시물 수정</h1>
      </header>
      <PostForm mode="edit" postId={id} />
    </main>
  );
}
