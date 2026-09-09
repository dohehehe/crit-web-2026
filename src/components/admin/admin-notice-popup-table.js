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

export function AdminNoticePopupTable({ popups }) {
  const { mutate } = useApiMutation("PATCH");
  const [activeById, setActiveById] = useState({});
  const [pendingIds, setPendingIds] = useState(() => new Set());

  useEffect(() => {
    setActiveById(
      Object.fromEntries(popups.map((popup) => [popup.id, Boolean(popup.is_active)]))
    );
  }, [popups]);

  async function handleToggle(popupId) {
    const current = activeById[popupId] ?? false;
    const next = !current;

    setActiveById((prev) => ({ ...prev, [popupId]: next }));
    setPendingIds((prev) => new Set(prev).add(popupId));

    try {
      await mutate(`notice_popup/${popupId}`, { is_active: next });
    } catch {
      setActiveById((prev) => ({ ...prev, [popupId]: current }));
    } finally {
      setPendingIds((prev) => {
        const nextPending = new Set(prev);
        nextPending.delete(popupId);
        return nextPending;
      });
    }
  }

  if (popups.length === 0) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 팝업이 없습니다.</p>;
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
              Link URL
            </th>
            <th scope="col" className="caption">
              공개
            </th>
          </tr>
        </thead>
        <tbody>
          {popups.map((popup) => {
            const isActive = activeById[popup.id] ?? Boolean(popup.is_active);
            const isPending = pendingIds.has(popup.id);

            return (
              <tr key={popup.id}>
                <td className={`p ${styles.dateCell}`}>{formatCreatedAt(popup.created_at)}</td>
                <td className="p">
                  <Link href={`/admin/notice/popup/${popup.id}`} className={styles.titleLink}>
                    {popup.link_url ?? "—"}
                  </Link>
                </td>
                <td className="p">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`팝업 ${formatActiveStatus(isActive)}`}
                    className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
                    disabled={isPending}
                    onClick={() => handleToggle(popup.id)}
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
