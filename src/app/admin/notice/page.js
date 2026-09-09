import { AdminNoticePanel } from "@/components/admin/admin-notice-panel";
import styles from "../contents/page.module.css";

export const metadata = {
  title: "공지 관리",
};

export default function AdminNoticePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="title-1">공지 관리</h1>
      </header>
      <AdminNoticePanel />
    </main>
  );
}
