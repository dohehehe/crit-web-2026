import { AdminInfoPanel } from "@/components/admin/admin-info-panel";
import styles from "../contents/page.module.css";

export const metadata = {
  title: "정보 관리",
};

export default function AdminInfoPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className="title-1">정보 관리</h1>
      </header>
      <AdminInfoPanel />
    </main>
  );
}
