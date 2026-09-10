"use client";

import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getKeywordPostCount } from "@/lib/admin/keywords-tab";
import { slugifyKeyword } from "@/lib/keywords/slugify";
import tableStyles from "@/components/admin/shared/admin-posts-table.module.css";
import styles from "@/components/admin/contents/admin-keywords-table.module.css";

function keywordToForm(keyword) {
  return {
    name: keyword.name ?? "",
    slug: keyword.slug ?? "",
  };
}

export function AdminKeywordsTable({ keywords, onChanged }) {
  const { mutate: updateKeyword } = useApiMutation("PATCH");
  const { mutate: deleteKeyword } = useApiMutation("DELETE");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [slugTouched, setSlugTouched] = useState(true);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!editingId) {
      return;
    }

    const keyword = keywords.find((item) => item.id === editingId);
    if (!keyword) {
      setEditingId(null);
      return;
    }

    setForm(keywordToForm(keyword));
    setSlugTouched(true);
  }, [editingId, keywords]);

  function startEditing(keyword) {
    setErrorMessage(null);
    setEditingId(keyword.id);
    setForm(keywordToForm(keyword));
    setSlugTouched(true);
  }

  function cancelEditing() {
    setEditingId(null);
    setErrorMessage(null);
  }

  function updateField(name, value) {
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "name" && !slugTouched) {
        next.slug = slugifyKeyword(value);
      }

      return next;
    });
  }

  async function handleSave(keywordId) {
    const payload = {
      name: form.name.trim() || null,
      slug: form.slug.trim() || null,
    };

    setErrorMessage(null);
    setPendingIds((prev) => new Set(prev).add(keywordId));

    try {
      await updateKeyword(`keywords/${keywordId}`, payload);
      setEditingId(null);
      onChanged?.();
    } catch (error) {
      setErrorMessage(error.message ?? "저장하지 못했습니다.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(keywordId);
        return next;
      });
    }
  }

  async function handleDelete(keyword) {
    const label = keyword.name || keyword.slug || "이 키워드";
    const postCount = getKeywordPostCount(keyword);

    const message =
      postCount > 0
        ? `${label}을(를) 삭제할까요? ${postCount}개 게시물에서 이 키워드 태그가 제거됩니다.`
        : `${label}을(를) 삭제할까요?`;

    if (!window.confirm(message)) {
      return;
    }

    setErrorMessage(null);
    setPendingIds((prev) => new Set(prev).add(keyword.id));

    try {
      await deleteKeyword(`keywords/${keyword.id}`);

      if (editingId === keyword.id) {
        setEditingId(null);
      }

      onChanged?.();
    } catch (error) {
      setErrorMessage(error.message ?? "삭제하지 못했습니다.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(keyword.id);
        return next;
      });
    }
  }

  if (keywords.length === 0) {
    return <p className={`${tableStyles.empty} caption gray-65`}>등록된 키워드가 없습니다.</p>;
  }

  return (
    <>
      {errorMessage && (
        <p className={`${styles.error} caption`}>저장하지 못했습니다: {errorMessage}</p>
      )}

      <div className={tableStyles.wrapper}>
        <table className={`${tableStyles.table} ${styles.table}`}>
          <thead>
            <tr>
              <th scope="col" className={`caption ${styles.colKeyword}`}>
                Keyword
              </th>
              <th scope="col" className={`caption ${styles.colSlug}`}>
                Slug
              </th>
              <th scope="col" className={`caption ${styles.colPosts}`}>
                게시물
              </th>
              <th scope="col" className={styles.colActions} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {keywords.map((keyword) => {
              const isEditing = editingId === keyword.id;
              const isPending = pendingIds.has(keyword.id);

              return (
                <tr key={keyword.id}>
                  <td className={`p ${styles.colKeyword}`}>
                    {isEditing ? (
                      <input
                        className={styles.input}
                        type="text"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        disabled={isPending}
                        autoFocus
                      />
                    ) : (
                      <span className={`tag-keyword ${styles.cellContent}`}>
                        {keyword.name ?? "—"}
                      </span>
                    )}
                  </td>
                  <td className={`p ${styles.colSlug}`}>
                    {isEditing ? (
                      <input
                        className={styles.input}
                        type="text"
                        value={form.slug}
                        onChange={(event) => {
                          setSlugTouched(true);
                          updateField("slug", event.target.value);
                        }}
                        disabled={isPending}
                      />
                    ) : (
                      <span className={styles.cellContent}>{keyword.slug ?? "—"}</span>
                    )}
                  </td>
                  <td className={`p ${styles.colPosts}`}>{getKeywordPostCount(keyword)}</td>
                  <td className={`p ${styles.colActions} ${styles.actionsCell}`}>
                    <div className={styles.actions}>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className={`${styles.actionButton} caption`}
                            onClick={() => handleSave(keyword.id)}
                            disabled={isPending || !form.name.trim()}
                          >
                            {isPending ? "저장 중…" : "저장"}
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionButton} caption`}
                            onClick={cancelEditing}
                            disabled={isPending}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={`${styles.actionButton} caption`}
                            onClick={() => startEditing(keyword)}
                            disabled={isPending || editingId !== null}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.deleteButton} caption`}
                            onClick={() => handleDelete(keyword)}
                            disabled={isPending || editingId !== null}
                          >
                            {isPending ? "삭제 중…" : "삭제"}
                          </button>
                        </>
                      )}
                    </div>
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
