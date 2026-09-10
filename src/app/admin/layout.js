import { AdminNav } from "@/components/admin/layout/admin-nav";
import styles from "@/app/admin/admin-layout.module.css";

export const metadata = {
  title: {
    template: "%s | CRIT Admin",
    default: "관리자 | CRIT",
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.shell}>
      <AdminNav />
      {children}
    </div>
  );
}
