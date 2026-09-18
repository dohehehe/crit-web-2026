"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import styles from "@/components/admin/shared/admin-posts-table.module.css";

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

export function AdminNoticeBannerTable({ banners }) {
  const { mutate } = useApiMutation("PATCH");
  const [activeById, setActiveById] = useState({});
  const [pendingIds, setPendingIds] = useState(() => new Set());

  useEffect(() => {
    setActiveById(
      Object.fromEntries(banners.map((banner) => [banner.id, Boolean(banner.is_active)]))
    );
  }, [banners]);

  async function handleToggle(bannerId) {
    const current = activeById[bannerId] ?? false;
    const next = !current;

    setActiveById((prev) => ({ ...prev, [bannerId]: next }));
    setPendingIds((prev) => new Set(prev).add(bannerId));

    try {
      await mutate(`banner/${bannerId}`, { is_active: next });
    } catch {
      setActiveById((prev) => ({ ...prev, [bannerId]: current }));
    } finally {
      setPendingIds((prev) => {
        const nextPending = new Set(prev);
        nextPending.delete(bannerId);
        return nextPending;
      });
    }
  }

  if (banners.length === 0) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 배너가 없습니다.</p>;
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
              연결 링크
            </th>
            <th scope="col" className="caption">
              공개
            </th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => {
            const isActive = activeById[banner.id] ?? Boolean(banner.is_active);
            const isPending = pendingIds.has(banner.id);

            return (
              <tr key={banner.id}>
                <td className={`p ${styles.dateCell}`}>{formatCreatedAt(banner.created_at)}</td>
                <td className="p">
                  <Link href={`/admin/notice/banner/${banner.id}`} className={styles.titleLink}>
                    {banner.link_url ?? "—"}
                  </Link>
                </td>
                <td className="p">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`배너 ${formatActiveStatus(isActive)}`}
                    className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
                    disabled={isPending}
                    onClick={() => handleToggle(banner.id)}
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
