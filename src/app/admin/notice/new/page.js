import Link from "next/link";
import { NoticeForm } from "@/components/admin/notice/notice-form";
import styles from "@/app/admin/admin-page.module.css";

export const metadata = {
  title: "새 공지",
};

export default function NewNoticePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/notice" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">새 공지</h1>
      </header>
      <NoticeForm mode="create" />
    </main>
  );
}
