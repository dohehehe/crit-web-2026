import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  title: {
    template: "%s | CRIT Admin",
    default: "관리자 | CRIT",
  },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
