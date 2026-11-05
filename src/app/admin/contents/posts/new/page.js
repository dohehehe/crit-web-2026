"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PostForm } from "@/components/admin/contents/post-form";
import { contentsSectionHref } from "@/lib/admin/admin-routes";
import styles from "@/app/admin/contents/posts/post-page.module.css";

function NewPostPageContent() {
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const categoryId = searchParams.get("categoryId");
  const issueId = searchParams.get("issueId");
  const listHref = contentsSectionHref(sectionId);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href={listHref} className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">새 게시물</h1>
      </header>
      {sectionId ? (
        <PostForm
          mode="create"
          sectionId={sectionId}
          defaultCategoryId={categoryId}
          defaultIssueId={issueId}
        />
      ) : (
        <p className="caption">
          sectionId가 필요합니다.{" "}
          <Link href="/admin/contents" className={styles.backLink}>
            콘텐츠 관리로 돌아가기
          </Link>
        </p>
      )}
    </main>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<p className="caption gray-65">불러오는 중…</p>}>
      <NewPostPageContent />
    </Suspense>
  );
}
