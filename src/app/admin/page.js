import { AdminPostsPanel } from "@/components/admin/admin-posts-panel";
import styles from "./page.module.css";

export const metadata = {
  title: "관리자 | CRIT",
};

export default function AdminPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="title-1">관리자</h1>
      </header>
      <AdminPostsPanel />
    </main>
  );
}
