import Link from "next/link";
import { EditorsForm } from "@/components/admin/info/editors-form";
import styles from "@/app/admin/admin-page.module.css";

export const metadata = {
  title: "새 에디터",
};

export default function NewEditorPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/info?tab=editors" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">새 에디터</h1>
      </header>
      <EditorsForm mode="create" />
    </main>
  );
}
