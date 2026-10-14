import { redirect } from "next/navigation";
import { NoticeList } from "@/components/notice/NoticeList";
import { NoticePagination } from "@/components/notice/NoticePagination";
import { NOTICE_PAGE_SIZE } from "@/lib/notice/constants";
import { getNoticesPage } from "@/lib/notice/getNotices";
import styles from "@/app/notice/page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "공지사항",
};

function parsePage(value) {
  const parsed = Number.parseInt(String(value ?? "1"), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function NoticePage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const result = await getNoticesPage({
    page: requestedPage,
    pageSize: NOTICE_PAGE_SIZE,
  });

  if (result.total > 0 && requestedPage > result.totalPages) {
    redirect(
      result.totalPages > 1 ? `/notice?page=${result.totalPages}` : "/notice"
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={`menu-kr ${styles.title}`}>공지사항</h1>
      </header>

      <NoticeList notices={result.items} />
      {result.total > 0 ? (
        <NoticePagination page={result.page} totalPages={result.totalPages} />
      ) : null}
    </main>
  );
}
