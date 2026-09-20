import { PostSearchListItem } from "@/components/posts/PostSearchListItem";
import styles from "@/components/posts/PostSearch.module.css";

export function PostSearchList({ posts }) {
  if (!posts?.length) {
    return <p className={`${styles.empty} caption gray-65`}>검색 결과가 없습니다.</p>;
  }

  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.id}>
          <PostSearchListItem post={post} />
        </li>
      ))}
    </ul>
  );
}
