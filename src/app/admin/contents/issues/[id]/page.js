import Link from "next/link";
import { IssueForm } from "@/components/admin/issue-form";
import styles from "../../posts/post-page.module.css";

export const metadata = {
  title: "이슈 수정",
};

export default async function EditIssuePage({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/contents" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">이슈 수정</h1>
      </header>
      <IssueForm mode="edit" issueId={id} />
    </main>
  );
}
