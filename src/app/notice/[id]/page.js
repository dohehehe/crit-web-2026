import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorContent } from "@/components/editor/EditorContent";
import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getNoticeById } from "@/lib/notice/getNotices";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { resolveNoticeShareImage } from "@/lib/seo/resolveShareImage";
import { truncatePlainText } from "@/lib/text/truncatePlainText";
import styles from "@/app/notice/[id]/page.module.css";

export const dynamic = "force-dynamic";

function formatNoticeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const notice = await getNoticeById(id);

  if (!notice) {
    return {
      title: "공지사항",
    };
  }

  const description = truncatePlainText(
    getEditorParagraphPlainText(notice.content)
  );

  return buildPageMetadata({
    title: notice.title ?? "공지사항",
    description,
    path: `/notice/${notice.id}`,
    image: resolveNoticeShareImage(notice),
    type: "article",
    publishedTime: notice.date ? `${notice.date}T00:00:00+09:00` : undefined,
  });
}

export default async function NoticeDetailPage({ params }) {
  const { id } = await params;
  const notice = await getNoticeById(id);

  if (!notice) {
    notFound();
  }

  const formattedDate = formatNoticeDate(notice.date);

  return (
    <main className={styles.main}>
      <Link href="/notice" className={`caption ${styles.backLink}`}>
        ← 목록으로
      </Link>

      <header className={styles.header}>
        <div className={styles.meta}>
          {notice.isPrimary ? (
            <span className={`caption ${styles.badge}`}>고정</span>
          ) : null}
          {formattedDate ? (
            <time className={`caption ${styles.date}`} dateTime={notice.date}>
              {formattedDate}
            </time>
          ) : null}
        </div>
        <h1 className={`title-1 ${styles.title}`}>
          {notice.title ?? "제목 없음"}
        </h1>
      </header>

      {notice.content ? <EditorContent contents={notice.content} /> : null}
    </main>
  );
}
