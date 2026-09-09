import Link from "next/link";
import { NoticePopupForm } from "@/components/admin/notice-popup-form";
import styles from "../../../admin-page.module.css";

export const metadata = {
  title: "팝업 수정",
};

export default async function EditNoticePopupPage({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/notice" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">팝업 수정</h1>
      </header>
      <NoticePopupForm mode="edit" popupId={id} />
    </main>
  );
}
