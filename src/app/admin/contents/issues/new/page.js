import Link from "next/link";
import { IssueForm } from "@/components/admin/issue-form";
import styles from "../../posts/post-page.module.css";

export const metadata = {
  title: "새 이슈",
};

export default function NewIssuePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/contents" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">새 이슈</h1>
      </header>
      <IssueForm mode="create" />
    </main>
  );
}
