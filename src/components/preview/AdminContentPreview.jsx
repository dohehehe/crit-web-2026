"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { JournalCritView } from "@/components/journal/JournalCritView";
import { PostView } from "@/components/posts/PostView";
import {
  mapIssuePreviewRecordToJournalView,
  mapPostPreviewRecordToPostView,
  readPostPreviewRecord,
} from "@/lib/admin/postPreview";
import sectionMainStyles from "@/app/[slug]/page.module.css";
import journalMainStyles from "@/components/journal/JournalCritView.module.css";
import previewStyles from "@/components/preview/AdminPostPreview.module.css";

function PreviewBanner() {
  return (
    <div className={previewStyles.banner} role="status">
      <p className={`${previewStyles.bannerText} caption`}>
        미리보기 — 저장되지 않은 내용입니다
      </p>
      <button
        type="button"
        className={`${previewStyles.closeButton} caption`}
        onClick={() => window.close()}
      >
        창 닫기
      </button>
    </div>
  );
}

function PreviewEmpty({ variant }) {
  const isIssue = variant === "issue";

  return (
    <main className={sectionMainStyles.main}>
      <p className={`${previewStyles.empty} caption gray-65`}>
        미리볼 내용이 없습니다. 관리자에서{" "}
        {isIssue ? "Journal Crit 이슈" : "게시물"} 작성 화면의「미리보기」를
        눌러 주세요.{" "}
        <Link href="/admin/contents" className={previewStyles.adminLink}>
          콘텐츠 관리로 이동
        </Link>
      </p>
    </main>
  );
}

export function AdminContentPreview({ variant }) {
  const [record, setRecord] = useState(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useLayoutEffect(() => {
    setRecord(readPostPreviewRecord());
    setHasLoadedStorage(true);
  }, []);

  const postViewModel = useMemo(
    () => (variant === "post" ? mapPostPreviewRecordToPostView(record) : null),
    [record, variant],
  );

  const issueViewModel = useMemo(
    () =>
      variant === "issue" ? mapIssuePreviewRecordToJournalView(record) : null,
    [record, variant],
  );

  if (!hasLoadedStorage) {
    return (
      <main className={sectionMainStyles.main}>
        <p className={`${previewStyles.empty} caption gray-65`}>
          미리보기 불러오는 중…
        </p>
      </main>
    );
  }

  const kind = record?.kind ?? (variant === "issue" ? null : "post");

  if (!record || kind !== variant) {
    return <PreviewEmpty variant={variant} />;
  }

  if (variant === "issue" && issueViewModel) {
    const { issue, posts, previousIssues } = issueViewModel;

    return (
      <>
        <PreviewBanner />
        <main
          className={`${journalMainStyles.main} ${journalMainStyles.mainOrange}`}
          data-journal-issue
        >
          <JournalCritView
            issue={issue}
            posts={posts}
            previousIssues={previousIssues}
          />
        </main>
      </>
    );
  }

  if (variant === "post" && postViewModel) {
    const { post, issue, issuePosts, sectionMode } = postViewModel;
    const isChannel = sectionMode === "channel";
    const isJournal = sectionMode === "journal";

    const mainClassName = isJournal
      ? journalMainStyles.main
      : sectionMainStyles.main;

    return (
      <>
        <PreviewBanner />
        <main
          className={mainClassName}
          {...(isChannel ? { "data-channel-section": "" } : {})}
        >
          <PostView
            post={post}
            issue={issue}
            issuePosts={issuePosts}
            banner={null}
          />
        </main>
      </>
    );
  }

  return <PreviewEmpty variant={variant} />;
}
