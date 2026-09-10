import { AdminPostsPanel } from "@/components/admin/contents/admin-posts-panel";
import styles from "@/app/admin/contents/page.module.css";

export const metadata = {
  title: "콘텐츠 관리",
};

export default function AdminContentsPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="title-1">콘텐츠 관리</h1>
      </header>
      <AdminPostsPanel />
    </main>
  );
}
