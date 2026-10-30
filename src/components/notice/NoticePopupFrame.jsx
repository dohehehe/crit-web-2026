"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/notice/NoticePopup.module.css";

const HOME_PATH = "/";
const CASCADE_OFFSET = 28;

export function NoticePopupFrame({
  index = 0,
  thumbnailImg = null,
  linkUrl = null,
  children = null,
}) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const open = pathname === HOME_PATH && !dismissed;

  function handleClose() {
    setDismissed(true);
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
