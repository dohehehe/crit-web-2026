"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import tableStyles from "@/components/admin/shared/admin-posts-table.module.css";
import styles from "@/components/admin/info/admin-editors-table.module.css";

function formatOrder(value) {
  if (value == null || value === "") {
    return "—";
  }

  return String(value);
}

export function AdminEditorsTable({ editors, onChanged }) {
  const { mutate: deleteEditor } = useApiMutation("DELETE");
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleDelete(editor) {
    const label = editor.name || editor.name_en || "이 에디터";

    if (!window.confirm(`${label}을(를) 삭제할까요?`)) {
      return;
    }

    setErrorMessage(null);
    setPendingIds((prev) => new Set(prev).add(editor.id));

    try {
      await deleteEditor(`editors/${editor.id}`);
      onChanged?.();
    } catch (error) {
      setErrorMessage(error.message ?? "삭제하지 못했습니다.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(editor.id);
        return next;
      });
    }
  }

  if (editors.length === 0) {
    return (
      <p className={`${tableStyles.empty} caption gray-65`}>등록된 에디터가 없습니다.</p>
    );
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
              <th scope="col" className={`caption ${styles.colOrder}`}>
                순서
              </th>
              <th scope="col" className={`caption ${styles.colName}`}>
                이름
              </th>
              <th scope="col" className={`caption ${styles.colNameEn}`}>
                영문 이름
              </th>
              <th scope="col" className={styles.colActions} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {editors.map((editor) => {
              const isPending = pendingIds.has(editor.id);

              return (
                <tr key={editor.id}>
                  <td className={`p ${styles.colOrder}`}>{formatOrder(editor.order)}</td>
                  <td className={`p ${styles.colName}`}>
                    <Link
                      href={`/admin/info/editors/${editor.id}`}
                      className={`${tableStyles.titleLink} ${styles.nameLink}`}
                    >
                      {editor.name ?? "—"}
                    </Link>
                  </td>
                  <td className={`p ${styles.colNameEn}`}>
                    <span className={styles.cellContent}>{editor.name_en ?? "—"}</span>
                  </td>
                  <td className={`p ${styles.colActions} ${styles.actionsCell}`}>
                    <button
                      type="button"
                      className={`${styles.deleteButton} caption`}
                      onClick={() => handleDelete(editor)}
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
