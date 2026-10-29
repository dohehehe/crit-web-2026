import { AdminInfoPanel } from "@/components/admin/info/admin-info-panel";
import styles from "@/app/admin/contents/page.module.css";

export const metadata = {
  title: "정보 관리",
};

export default async function AdminInfoPage({ searchParams }) {
  const params = await searchParams;
  const initialTab = typeof params.tab === "string" ? params.tab : "info";

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="title-1">정보 관리</h1>
      </header>
      <AdminInfoPanel initialTab={initialTab} />
    </main>
  );
}
