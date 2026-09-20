import { PostSearchList } from "@/components/posts/PostSearchList";
import {
  getSearchTagLabel,
  searchByQuery,
  searchByTag,
} from "@/lib/search/searchContent";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const { q, tag } = await searchParams;
  const trimmed = q?.trim();

  if (trimmed) {
    return {
      title: `"${trimmed}" 검색`,
    };
  }

  if (tag) {
    const tagLabel = await getSearchTagLabel(tag);

    if (tagLabel) {
      return {
        title: `"${tagLabel}" 검색`,
      };
    }
  }

  return { title: "Search" };
}

export default async function SearchPage({ searchParams }) {
  const { q, tag } = await searchParams;
  const trimmedQuery = q?.trim() ?? "";
  const hasQuery = Boolean(trimmedQuery);
  const hasTag = Boolean(tag);

  let entries = [];
  let tagLabel = null;

  if (hasTag) {
    [entries, tagLabel] = await Promise.all([searchByTag(tag), getSearchTagLabel(tag)]);
  } else if (hasQuery) {
    entries = await searchByQuery(trimmedQuery);
  }

  const resultLabel = hasQuery ? trimmedQuery : tagLabel;

  return (
    <main className={styles.main}>
      {resultLabel ? (
        <header className={styles.header}>
          <p className={`title-1 ${styles.query}`}>
            &ldquo;<span className="crit-orange">{resultLabel}</span>&rdquo;
          </p>
          <h1 className={`title-1 ${styles.heading}`}>검색 결과</h1>
        </header>
      ) : null}

      {!hasQuery && !hasTag ? (
        <p className={`caption gray-65 ${styles.prompt}`}>검색어를 입력하세요.</p>
      ) : (
        <PostSearchList
          key={hasTag ? `tag:${tag}` : `q:${trimmedQuery}`}
          entries={entries}
        />
      )}
    </main>
  );
}
