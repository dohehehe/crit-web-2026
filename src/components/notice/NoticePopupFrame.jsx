"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/notice/NoticePopup.module.css";

const HOME_PATH = "/";
const CASCADE_OFFSET = 28;
const HIDE_TODAY_KEY = "crit-notice-popup-hide-today";

function readHideTodayMap() {
  try {
    const raw = window.localStorage.getItem(HIDE_TODAY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function isHiddenToday(id) {
  const until = readHideTodayMap()[String(id)];
  return typeof until === "number" && until > Date.now();
}

function hideForToday(id) {
  try {
    const now = Date.now();
    const hidden = readHideTodayMap();

    for (const key of Object.keys(hidden)) {
      if (typeof hidden[key] !== "number" || hidden[key] <= now) {
        delete hidden[key];
      }
    }

    const endOfToday = new Date();
    endOfToday.setHours(24, 0, 0, 0);
    hidden[String(id)] = endOfToday.getTime();
    window.localStorage.setItem(HIDE_TODAY_KEY, JSON.stringify(hidden));
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
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [hiddenToday, setHiddenToday] = useState(false);
  const open = pathname === HOME_PATH && !dismissed && !hiddenToday;

  useLayoutEffect(() => {
    setHiddenToday(isHiddenToday(id));
  }, [id]);

  function handleClose() {
    setDismissed(true);
  }

  function handleHideToday() {
    hideForToday(id);
    setHiddenToday(true);
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
          className={`caption ${styles.headerButton}`}
          onClick={handleHideToday}
        >
          오늘하루 보지 않기
        </button>
        <button
          type="button"
          className={`caption ${styles.headerButton}`}
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
