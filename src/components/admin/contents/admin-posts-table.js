"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { sortPostsByDateDesc } from "@/lib/admin/sortPostsByDate";
import styles from "@/components/admin/shared/admin-posts-table.module.css";

function formatActiveStatus(isActive) {
  return isActive ? "공개" : "비공개";
}

function formatPostDate(date) {
  if (!date) {
    return "—";
  }

  return date;
}

export function AdminPostsTable({ posts }) {
  const { mutate } = useApiMutation("PATCH");
  const [activeById, setActiveById] = useState({});
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const sortedPosts = useMemo(() => sortPostsByDateDesc(posts), [posts]);

  useEffect(() => {
    setActiveById(
      Object.fromEntries(sortedPosts.map((post) => [post.id, Boolean(post.is_active)]))
    );
  }, [sortedPosts]);

  async function handleToggle(postId) {
    const current = activeById[postId] ?? false;
    const next = !current;

    setActiveById((prev) => ({ ...prev, [postId]: next }));
    setPendingIds((prev) => new Set(prev).add(postId));

    try {
      await mutate(`posts/${postId}`, { is_active: next });
    } catch {
      setActiveById((prev) => ({ ...prev, [postId]: current }));
    } finally {
      setPendingIds((prev) => {
        const nextPending = new Set(prev);
        nextPending.delete(postId);
        return nextPending;
      });
    }
  }

  if (sortedPosts.length === 0) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 게시물이 없습니다.</p>;
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
              Author
            </th>
            <th scope="col" className="caption">
              공개
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPosts.map((post) => {
            const isActive = activeById[post.id] ?? Boolean(post.is_active);
            const isPending = pendingIds.has(post.id);

            return (
              <tr key={post.id}>
                <td className={`p ${styles.dateCell}`}>{formatPostDate(post.date)}</td>
                <td className="p">
                  <Link href={`/admin/contents/posts/${post.id}`} className={styles.titleLink}>
                    {post.title ?? "—"}
                  </Link>
                </td>
                <td className="p">{post.authors?.name ?? "—"}</td>
                <td className="p">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`${post.title ?? "게시물"} ${formatActiveStatus(isActive)}`}
                    className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
                    disabled={isPending}
                    onClick={() => handleToggle(post.id)}
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
