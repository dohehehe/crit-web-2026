"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import styles from "./admin-posts-table.module.css";

function formatActiveStatus(isActive) {
  return isActive ? "공개" : "비공개";
}

function formatCreatedAt(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("ko-KR");
}

export function AdminNoticeTable({ notices }) {
  const { mutate } = useApiMutation("PATCH");
  const [activeById, setActiveById] = useState({});
  const [pendingIds, setPendingIds] = useState(() => new Set());

  useEffect(() => {
    setActiveById(
      Object.fromEntries(notices.map((notice) => [notice.id, Boolean(notice.is_active)]))
    );
  }, [notices]);

  async function handleToggle(noticeId) {
    const current = activeById[noticeId] ?? false;
    const next = !current;

    setActiveById((prev) => ({ ...prev, [noticeId]: next }));
    setPendingIds((prev) => new Set(prev).add(noticeId));

    try {
      await mutate(`notice/${noticeId}`, { is_active: next });
    } catch {
      setActiveById((prev) => ({ ...prev, [noticeId]: current }));
    } finally {
      setPendingIds((prev) => {
        const nextPending = new Set(prev);
        nextPending.delete(noticeId);
        return nextPending;
      });
    }
  }

  if (notices.length === 0) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 공지가 없습니다.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className="caption">
              Date
            </th>
            <th scope="col" className="caption">
              Title
            </th>
            <th scope="col" className="caption">
              공개
            </th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => {
            const isActive = activeById[notice.id] ?? Boolean(notice.is_active);
            const isPending = pendingIds.has(notice.id);

            return (
              <tr key={notice.id}>
                <td className={`p ${styles.dateCell}`}>{formatCreatedAt(notice.created_at)}</td>
                <td className="p">
                  <Link href={`/admin/notice/${notice.id}`} className={styles.titleLink}>
                    {notice.title ?? "—"}
                  </Link>
                </td>
                <td className="p">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`${notice.title ?? "공지"} ${formatActiveStatus(isActive)}`}
                    className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
                    disabled={isPending}
                    onClick={() => handleToggle(notice.id)}
                  >
                    <span className={styles.toggleTrack}>
                      <span className={styles.toggleThumb} />
                    </span>
                    <span className={`${styles.toggleLabel} caption`}>
                      {formatActiveStatus(isActive)}
                    </span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
