import Link from "next/link";
import styles from "@/components/notice/NoticeList.module.css";

function buildHref(page) {
  return page <= 1 ? "/notice" : `/notice?page=${page}`;
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  for (let offset = 1; offset <= 2; offset += 1) {
    pages.add(currentPage - offset);
    pages.add(currentPage + offset);
  }

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export function NoticePagination({ page, totalPages }) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className={styles.pagination} aria-label="공지 페이지">
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className={`caption ${styles.pageLink}`}
        >
          이전
        </Link>
      ) : (
        <span className={`caption ${styles.pageDisabled}`}>이전</span>
      )}

      {pageNumbers.map((pageNumber, index) => {
        const prev = pageNumbers[index - 1];
        const showEllipsis = prev != null && pageNumber - prev > 1;
        const isCurrent = pageNumber === page;

        return (
          <span key={pageNumber}>
            {showEllipsis ? (
              <span className={`caption ${styles.pageDisabled}`}>…</span>
            ) : null}
            {isCurrent ? (
              <span
                className={`caption ${styles.pageCurrent}`}
                aria-current="page"
              >
                {pageNumber}
              </span>
            ) : (
              <Link
                href={buildHref(pageNumber)}
                className={`caption ${styles.pageLink}`}
              >
                {pageNumber}
              </Link>
            )}
          </span>
        );
      })}

      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className={`caption ${styles.pageLink}`}
        >
          다음
        </Link>
      ) : (
        <span className={`caption ${styles.pageDisabled}`}>다음</span>
      )}
    </nav>
  );
}
