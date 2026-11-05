import Link from "next/link";
import { IssueForm } from "@/components/admin/contents/issue-form";
import { contentsSectionHref } from "@/lib/admin/admin-routes";
import styles from "@/app/admin/contents/posts/post-page.module.css";

export const metadata = {
  title: "이슈 수정",
};

export default async function EditIssuePage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const sectionId = typeof query.sectionId === "string" ? query.sectionId : "";

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href={contentsSectionHref(sectionId)} className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">이슈 수정</h1>
      </header>
      <IssueForm mode="edit" issueId={id} sectionId={sectionId} />
    </main>
  );
}
