"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import tableStyles from "@/components/admin/shared/admin-posts-table.module.css";
import styles from "@/components/admin/info/admin-editors-table.module.css";

function normalizeOrder(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortEditors(editors) {
  return editors
    .map((editor, index) => ({ editor, index }))
    .sort((a, b) => {
      const orderA = normalizeOrder(a.editor.order);
      const orderB = normalizeOrder(b.editor.order);

      if (orderA != null && orderB != null && orderA !== orderB) {
        return orderA - orderB;
      }

      if (orderA != null && orderB == null) {
        return -1;
      }

      if (orderA == null && orderB != null) {
        return 1;
      }

      return a.index - b.index;
    })
    .map(({ editor }) => editor);
}

function moveEditors(editors, index, direction) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= editors.length) {
    return null;
  }

  const next = [...editors];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);

  return next;
}

export function AdminEditorsTable({ editors, onChanged }) {
  const { mutate: deleteEditor } = useApiMutation("DELETE");
  const { mutate: updateEditor } = useApiMutation("PATCH");
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [isReordering, setIsReordering] = useState(false);
  const [orderedIds, setOrderedIds] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const sortedEditors = useMemo(() => sortEditors(editors), [editors]);
  const displayEditors = useMemo(() => {
    if (!orderedIds) {
      return sortedEditors;
    }

    const byId = new Map(sortedEditors.map((editor) => [editor.id, editor]));
    const next = orderedIds.map((id) => byId.get(id)).filter(Boolean);

    for (const editor of sortedEditors) {
      if (!orderedIds.includes(editor.id)) {
        next.push(editor);
      }
    }

    return next;
  }, [orderedIds, sortedEditors]);

  useEffect(() => {
    setOrderedIds(null);
  }, [sortedEditors]);

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

  async function handleMove(index, direction) {
    const nextEditors = moveEditors(displayEditors, index, direction);

    if (!nextEditors) {
      return;
    }

    const updates = nextEditors.flatMap((editor, order) =>
      normalizeOrder(editor.order) === order ? [] : [{ id: editor.id, order }]
    );

    setErrorMessage(null);
    setOrderedIds(nextEditors.map((editor) => editor.id));
    setIsReordering(true);

    try {
      await Promise.all(
        updates.map((update) =>
          updateEditor(`editors/${update.id}`, { order: update.order })
        )
      );
      await onChanged?.();
    } catch (error) {
      setOrderedIds(null);
      setErrorMessage(error.message ?? "순서를 바꾸지 못했습니다.");
    } finally {
      setIsReordering(false);
    }
  }

  if (displayEditors.length === 0) {
    return (
      <p className={`${tableStyles.empty} caption gray-65`}>
        등록된 에디터가 없습니다.
      </p>
    );
  }

  return (
    <>
      {errorMessage && (
        <p className={`${styles.error} caption`}>{errorMessage}</p>
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
              <th
                scope="col"
                className={styles.colActions}
                aria-label="Actions"
              />
            </tr>
          </thead>
          <tbody>
            {displayEditors.map((editor, index) => {
              const isPending = pendingIds.has(editor.id);
              const isFirst = index === 0;
              const isLast = index === displayEditors.length - 1;
              const label = editor.name || editor.name_en || "에디터";

              return (
                <tr key={editor.id}>
                  <td className={`p ${styles.colOrder}`}>
                    <div className={tableStyles.reorderButtons}>
                      <button
                        type="button"
                        className={`${tableStyles.reorderButton} caption`}
                        aria-label={`${label} 위로`}
                        disabled={isFirst || isReordering || isPending}
                        onClick={() => handleMove(index, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={`${tableStyles.reorderButton} caption`}
                        aria-label={`${label} 아래로`}
                        disabled={isLast || isReordering || isPending}
                        onClick={() => handleMove(index, 1)}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className={`p ${styles.colName}`}>
                    <Link
                      href={`/admin/info/editors/${editor.id}`}
                      className={`${tableStyles.titleLink} ${styles.nameLink}`}
                    >
                      {editor.name ?? "—"}
                    </Link>
                  </td>
                  <td className={`p ${styles.colNameEn}`}>
                    <span className={styles.cellContent}>
                      {editor.name_en ?? "—"}
                    </span>
                  </td>
                  <td
                    className={`p ${styles.colActions} ${styles.actionsCell}`}
                  >
                    <button
                      type="button"
                      className={`${styles.deleteButton} caption`}
                      onClick={() => handleDelete(editor)}
                      disabled={isPending || isReordering}
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
