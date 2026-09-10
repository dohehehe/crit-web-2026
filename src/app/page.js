import { PostList } from "@/components/posts/PostList";
import { getPosts } from "@/lib/posts/getPosts";
import styles from "./page.module.css";

export const revalidate = 60;

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className={styles.main}>
      <PostList posts={posts} />
    </main>
  );
}
