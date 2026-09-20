import { PostSearchListItem } from "@/components/posts/PostSearchListItem";
import styles from "@/components/posts/PostSearch.module.css";

export function PostSearchList({ entries }) {
  if (!entries?.length) {
    return <p className={`${styles.empty} caption gray-65`}>검색 결과가 없습니다.</p>;
  }

  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <li key={entry.key}>
          <PostSearchListItem entry={entry} />
        </li>
      ))}
    </ul>
  );
}
