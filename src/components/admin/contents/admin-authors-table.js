"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildAuthorEditHref, getAuthorPostCount } from "@/lib/admin/authors-tab";
import tableStyles from "@/components/admin/shared/admin-posts-table.module.css";
import styles from "@/components/admin/contents/admin-authors-table.module.css";

export function AdminAuthorsTable({ authors, onChanged }) {
  const { mutate: deleteAuthor } = useApiMutation("DELETE");
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleDelete(author) {
    const label = author.name || author.slug || "이 저자";
    const postCount = getAuthorPostCount(author);

    const message =
      postCount > 0
        ? `${label}을(를) 삭제할까요? ${postCount}개 게시물의 저자 연결이 해제됩니다.`
        : `${label}을(를) 삭제할까요?`;

    if (!window.confirm(message)) {
      return;
    }

    setErrorMessage(null);
    setPendingIds((prev) => new Set(prev).add(author.id));

    try {
      await deleteAuthor(`authors/${author.id}`);
      onChanged?.();
    } catch (error) {
      setErrorMessage(error.message ?? "삭제하지 못했습니다.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(author.id);
        return next;
      });
    }
  }

  if (authors.length === 0) {
    return <p className={`${tableStyles.empty} caption gray-65`}>등록된 저자가 없습니다.</p>;
  }

  return (
    <>
      {errorMessage && (
        <p className={`${styles.error} caption`}>삭제하지 못했습니다: {errorMessage}</p>
      )}

      <div className={tableStyles.wrapper}>
        <table className={`${tableStyles.table} ${styles.table}`}>
          <thead>
            <tr>
              <th scope="col" className={`caption ${styles.colName}`}>
                Name
              </th>
              <th scope="col" className={`caption ${styles.colSlug}`}>
                Slug
              </th>
              <th scope="col" className={`caption ${styles.colEmail}`}>
                Email
              </th>
              <th scope="col" className={`caption ${styles.colPosts}`}>
                게시물
              </th>
              <th scope="col" className={styles.colActions} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => {
              const isPending = pendingIds.has(author.id);

              return (
                <tr key={author.id}>
                  <td className={`p ${styles.colName}`}>
                    <Link
                      href={buildAuthorEditHref(author.id)}
                      className={`${tableStyles.titleLink} ${styles.nameLink}`}
                    >
                      {author.name ?? "—"}
                    </Link>
                  </td>
                  <td className={`p ${styles.colSlug}`}>
                    <span className={styles.cellContent}>{author.slug ?? "—"}</span>
                  </td>
                  <td className={`p ${styles.colEmail}`}>
                    <span className={styles.cellContent}>{author.email ?? "—"}</span>
                  </td>
                  <td className={`p ${styles.colPosts}`}>{getAuthorPostCount(author)}</td>
                  <td className={`p ${styles.colActions} ${styles.actionsCell}`}>
                    <button
                      type="button"
                      className={`${styles.deleteButton} caption`}
                      onClick={() => handleDelete(author)}
                      disabled={isPending}
                    >
                      {isPending ? "삭제 중…" : "삭제"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
