import { AdminNav } from "@/components/admin/layout/admin-nav";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import styles from "@/app/admin/admin-layout.module.css";

export const metadata = {
  title: {
    template: "%s | CRIT Admin",
    default: "관리자 | CRIT",
  },
};

export default async function AdminLayout({ children }) {
  await requireAdmin("/admin");

  return (
    <div className={styles.shell}>
      <AdminNav />
      {children}
    </div>
  );
}
