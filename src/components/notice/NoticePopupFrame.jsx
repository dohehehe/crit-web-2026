"use client";

import { useEffect, useState } from "react";
import styles from "@/components/notice/NoticePopup.module.css";

const SESSION_KEY = "crit-notice-popup-dismissed";
const CASCADE_OFFSET = 28;

function readDismissedIds() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function markDismissed(id) {
  try {
    const dismissed = readDismissedIds();
    dismissed.add(id);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify([...dismissed]));
  } catch {
    // Ignore storage failures.
  }
}

export function NoticePopupFrame({
  id,
  index = 0,
  thumbnailImg = null,
  linkUrl = null,
  children = null,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!readDismissedIds().has(id));
  }, [id]);

  function handleClose() {
    markDismissed(id);
    setOpen(false);
  }

  if (!open) {
    return null;
  }

  const offset = index * CASCADE_OFFSET;
  const image = thumbnailImg ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={thumbnailImg} alt="" className={styles.image} />
  ) : null;

  return (
    <aside
      className={styles.popup}
      style={{
        "--popup-index": index,
        "--popup-offset": `${offset}px`,
      }}
      role="dialog"
      aria-modal="false"
      aria-label="공지 팝업"
    >
      <div className={styles.header}>
        <button
          type="button"
          className={`caption ${styles.closeButton}`}
          onClick={handleClose}
        >
          닫기
        </button>
      </div>
      <div className={styles.body}>
        {thumbnailImg ? (
          linkUrl ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.imageLink}
            >
              {image}
            </a>
          ) : (
            image
          )
        ) : (
          <div className={styles.content}>{children}</div>
        )}
      </div>
    </aside>
  );
}
