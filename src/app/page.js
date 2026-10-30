import { HomeNoticePopups } from "@/components/notice/HomeNoticePopups";
import { PostList } from "@/components/posts/PostList";
import { PreparingMessage } from "@/components/status/StatusMessage";
import { getActiveNoticePopups } from "@/lib/notice/getNoticePopups";
import { getPosts } from "@/lib/posts/getPosts";
import styles from "./page.module.css";

export const revalidate = 60;

export default async function Home() {
  const [posts, popups] = await Promise.all([
    getPosts(),
    getActiveNoticePopups().catch(() => []),
  ]);

  return (
    <>
      <HomeNoticePopups popups={popups} />
      {posts.length > 0 ? (
        <main className={styles.main}>
          <PostList posts={posts} showSectionLabel />
        </main>
      ) : (
        <PreparingMessage />
      )}
    </>
  );
}
