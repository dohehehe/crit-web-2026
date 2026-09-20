import { PostSearchList } from "@/components/posts/PostSearchList";
import { searchByQuery, searchByTag } from "@/lib/search/searchContent";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  const trimmed = q?.trim();

  if (!trimmed) {
    return { title: "Search" };
  }

  return {
    title: `"${trimmed}" 검색`,
  };
}

export default async function SearchPage({ searchParams }) {
  const { q, tag } = await searchParams;
  const trimmedQuery = q?.trim() ?? "";
  const hasQuery = Boolean(trimmedQuery);
  const hasTag = Boolean(tag);

  let entries = [];

  if (hasTag) {
    entries = await searchByTag(tag);
  } else if (hasQuery) {
    entries = await searchByQuery(trimmedQuery);
  }

  return (
    <main className={styles.main}>
      {hasQuery ? (
        <header className={styles.header}>
          <p className={`title-1 ${styles.query}`}>&ldquo;<span className="crit-orange">{trimmedQuery}</span>&rdquo;</p>
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
