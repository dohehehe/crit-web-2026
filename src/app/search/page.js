import { PostList } from "@/components/posts/PostList";
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

  let posts = [];
  let authors = [];
  let tagLabel = null;

  if (hasTag) {
    [posts, tagLabel] = await Promise.all([searchByTag(tag), getSearchTagLabel(tag)]);
  } else if (hasQuery) {
    ({ posts, authors } = await searchByQuery(trimmedQuery));
  }

  const resultLabel = hasQuery ? trimmedQuery : tagLabel;
  const hasResults = posts.length > 0 || authors.length > 0;

  return (
    <main className={styles.main}>

      {!hasQuery && !hasTag ? (
        <header className={`thumb-title ${styles.header}`}>
          <span>검색어를 입력하세요.</span>
        </header>
      ) : hasResults ? (
        <>
          {resultLabel ? (
            <header className={`thumb-title ${styles.header}`}>
              <span>Search Result for: {resultLabel}</span>
            </header>
          ) : null}

          <div className={styles.results}>
            {authors.length > 0 ? <PostSearchList entries={authors} /> : null}
            {posts.length > 0 ? <PostList posts={posts} showSectionLabel /> : null}
          </div>
        </>
      ) : (
        <header className={`thumb-title ${styles.header}`}>
          <span>검색 결과가 없습니다.</span>
        </header>
      )}

    </main>
  );
}
