"use client";

import { useState } from "react";
import { EditorContent } from "@/components/editor/EditorContent";
import styles from "@/components/notice/NoticeList.module.css";
import noticeProseStyles from "@/components/notice/editorProse.module.css";

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
  const [openId, setOpenId] = useState(null);

  if (!notices?.length) {
    return (
      <p className={`caption gray-65 ${styles.empty}`}>
        등록된 공지가 없습니다.
      </p>
    );
  }

  function toggleNotice(id) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <ul className={styles.list}>
      {notices.map((notice) => {
        const isOpen = openId === notice.id;
        const panelId = `notice-panel-${notice.id}`;

        return (
          <li key={notice.id} className={styles.item}>
            <button
              type="button"
              className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleNotice(notice.id)}
            >
              <time
                className={`tag-keyword ${styles.date}`}
                dateTime={notice.date ?? undefined}
              >
                {formatNoticeDate(notice.date)}
              </time>
              <div className={styles.content}>
                <span className={styles.meta}>
                  {notice.isPrimary ? (
                    <span className={styles.badge}>공지</span>
                  ) : null}
                  <span className={`p-bold ${styles.title}`}>
                    {notice.title ?? "제목 없음"}
                  </span>
                </span>

                <div
                  id={panelId}
                  className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
                  aria-hidden={!isOpen}
                  inert={!isOpen ? true : undefined}
                >
                  <div className={styles.body}>
                    {notice.content ? (
                      <EditorContent
                        contents={notice.content}
                        proseStyles={noticeProseStyles}
                      />
                    ) : (
                      <p className={`caption gray-65 ${styles.emptyBody}`}>
                        등록된 내용이 없습니다.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </button>


          </li>
        );
      })}
    </ul>
  );
}
