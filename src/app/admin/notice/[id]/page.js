import Link from "next/link";
import { NoticeForm } from "@/components/admin/notice/notice-form";
import styles from "@/app/admin/admin-page.module.css";

export const metadata = {
  title: "공지 수정",
};

export default async function EditNoticePage({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/notice" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">공지 수정</h1>
      </header>
      <NoticeForm mode="edit" noticeId={id} />
    </main>
  );
}
