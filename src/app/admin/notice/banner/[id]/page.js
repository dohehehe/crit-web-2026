import Link from "next/link";
import { BannerForm } from "@/components/admin/notice/banner-form";
import styles from "@/app/admin/admin-page.module.css";

export const metadata = {
  title: "배너 수정",
};

export default async function EditBannerPage({ params }) {
  const { id } = await params;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/notice" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">배너 수정</h1>
      </header>
      <BannerForm mode="edit" bannerId={id} />
    </main>
  );
}
