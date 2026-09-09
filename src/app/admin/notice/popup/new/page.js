import Link from "next/link";
import { NoticePopupForm } from "@/components/admin/notice/notice-popup-form";
import styles from "@/app/admin/admin-page.module.css";

export const metadata = {
  title: "새 팝업",
};

export default function NewNoticePopupPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/notice" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">새 팝업</h1>
      </header>
      <NoticePopupForm mode="create" />
    </main>
  );
}
