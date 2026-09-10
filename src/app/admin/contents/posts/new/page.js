"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PostForm } from "@/components/admin/contents/post-form";
import styles from "@/app/admin/contents/posts/post-page.module.css";

function NewPostContent() {
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const categoryId = searchParams.get("categoryId");
  const issueId = searchParams.get("issueId");

  if (!sectionId) {
    return (
      <p className="caption">
        sectionId가 필요합니다.{" "}
        <Link href="/admin/contents" className={styles.backLink}>
          콘텐츠 관리로 돌아가기
        </Link>
      </p>
    );
  }

  return (
    <PostForm
      mode="create"
      sectionId={sectionId}
      defaultCategoryId={categoryId}
      defaultIssueId={issueId}
    />
  );
}

export default function NewPostPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/admin/contents" className={`${styles.backLink} caption`}>
          ← 목록
        </Link>
        <h1 className="title-1">새 게시물</h1>
      </header>
      <Suspense fallback={<p className="caption gray-65">불러오는 중…</p>}>
        <NewPostContent />
      </Suspense>
    </main>
  );
}
