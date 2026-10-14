"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import styles from "@/components/admin/shared/admin-posts-table.module.css";

function formatActiveStatus(isActive) {
  return isActive ? "공개" : "비공개";
}

function formatPrimaryStatus(isPrimary) {
  return isPrimary ? "고정" : "일반";
}

function formatNoticeDate(value) {
  if (!value) {
    return "—";
  }

  return value;
}

function boolMapFromNotices(notices, field) {
  return Object.fromEntries(
    notices.map((notice) => [notice.id, Boolean(notice[field])])
  );
}

export function AdminNoticeTable({ notices }) {
  const { mutate } = useApiMutation("PATCH");
  const [activeById, setActiveById] = useState({});
  const [primaryById, setPrimaryById] = useState({});
  const [pendingKeys, setPendingKeys] = useState(() => new Set());

  useEffect(() => {
    setActiveById(boolMapFromNotices(notices, "is_active"));
    setPrimaryById(boolMapFromNotices(notices, "is_primary"));
  }, [notices]);

  async function handleToggle(noticeId, field) {
    const isPrimaryField = field === "is_primary";
    const valuesById = isPrimaryField ? primaryById : activeById;
    const setValuesById = isPrimaryField ? setPrimaryById : setActiveById;
    const current = valuesById[noticeId] ?? false;
    const next = !current;
    const pendingKey = `${noticeId}:${field}`;

    setValuesById((prev) => ({ ...prev, [noticeId]: next }));
    setPendingKeys((prev) => new Set(prev).add(pendingKey));

    try {
      await mutate(`notice/${noticeId}`, { [field]: next });
    } catch {
      setValuesById((prev) => ({ ...prev, [noticeId]: current }));
    } finally {
      setPendingKeys((prev) => {
        const nextPending = new Set(prev);
        nextPending.delete(pendingKey);
        return nextPending;
      });
    }
  }

  if (notices.length === 0) {
    return (
      <p className={`${styles.empty} caption gray-65`}>
        표시할 공지가 없습니다.
      </p>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className="caption">
              날짜
            </th>
            <th scope="col" className="caption">
              제목
            </th>
            <th scope="col" className="caption">
              고정
            </th>
            <th scope="col" className="caption">
              공개
            </th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => {
            const isActive = activeById[notice.id] ?? Boolean(notice.is_active);
            const isPrimary =
              primaryById[notice.id] ?? Boolean(notice.is_primary);
            const isActivePending = pendingKeys.has(`${notice.id}:is_active`);
            const isPrimaryPending = pendingKeys.has(`${notice.id}:is_primary`);

            return (
              <tr key={notice.id}>
                <td className={`p ${styles.dateCell}`}>
                  {formatNoticeDate(notice.date)}
                </td>
                <td className="p">
                  <Link
                    href={`/admin/notice/${notice.id}`}
                    className={styles.titleLink}
                  >
                    {notice.title ?? "—"}
                  </Link>
                </td>
                <td className="p">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPrimary}
                    aria-label={`${notice.title ?? "공지"} ${formatPrimaryStatus(isPrimary)}`}
                    className={`${styles.toggle} ${
                      isPrimary ? styles.toggleOn : styles.toggleOff
                    }`}
                    disabled={isPrimaryPending}
                    onClick={() => handleToggle(notice.id, "is_primary")}
                  >
                    <span className={styles.toggleTrack}>
                      <span className={styles.toggleThumb} />
                    </span>
                    <span className={`${styles.toggleLabel} caption`}>
                      {formatPrimaryStatus(isPrimary)}
                    </span>
                  </button>
                </td>
                <td className="p">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`${notice.title ?? "공지"} ${formatActiveStatus(isActive)}`}
                    className={`${styles.toggle} ${
                      isActive ? styles.toggleOn : styles.toggleOff
                    }`}
                    disabled={isActivePending}
                    onClick={() => handleToggle(notice.id, "is_active")}
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
