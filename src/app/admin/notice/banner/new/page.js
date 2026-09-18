import Link from "next/link";
import { BannerForm } from "@/components/admin/notice/banner-form";
import styles from "@/app/admin/admin-page.module.css";

export const metadata = {
  title: "새 배너",
};

export default function NewBannerPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/notice" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">새 배너</h1>
      </header>
      <BannerForm mode="create" />
    </main>
  );
}
