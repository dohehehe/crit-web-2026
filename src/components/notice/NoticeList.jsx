import Link from "next/link";
import styles from "@/components/notice/NoticeList.module.css";

function formatNoticeDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function NoticeList({ notices }) {
  if (!notices?.length) {
    return (
      <p className={`caption gray-65 ${styles.empty}`}>
        등록된 공지가 없습니다.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {notices.map((notice) => (
        <li key={notice.id} className={styles.item}>
          <Link href={`/notice/${notice.id}`} className={styles.link}>
            <time
              className={`caption ${styles.date}`}
              dateTime={notice.date ?? undefined}
            >
              {formatNoticeDate(notice.date)}
            </time>
            <div className={styles.meta}>
              {notice.isPrimary ? (
                <span className={`caption ${styles.badge}`}>고정</span>
              ) : null}
              <p className={`p ${styles.title}`}>
                {notice.title ?? "제목 없음"}
              </p>
            </div>

          </Link>
        </li>
      ))}
    </ul>
  );
}
