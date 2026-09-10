import { PostCard } from "@/components/posts/PostCard";
import styles from "./PostList.module.css";

export function PostList({ posts }) {
  if (!posts?.length) {
    return <p className={`${styles.empty} caption gray-65`}>게시물이 없습니다.</p>;
  }

  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
