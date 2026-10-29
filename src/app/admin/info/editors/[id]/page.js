import Link from "next/link";
import { EditorsForm } from "@/components/admin/info/editors-form";
import styles from "@/app/admin/admin-page.module.css";

export const metadata = {
  title: "에디터 수정",
};

export default async function EditEditorPage({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/info?tab=editors" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">에디터 수정</h1>
      </header>
      <EditorsForm mode="edit" editorId={id} />
    </main>
  );
}
