import { HomeNoticePopups } from "@/components/notice/HomeNoticePopups";
import { HomePostList } from "@/components/posts/HomePostList";
import { PreparingMessage } from "@/components/status/StatusMessage";
import { getActiveNoticePopups } from "@/lib/notice/getNoticePopups";
import { HOME_POST_PAGE_SIZE } from "@/lib/posts/constants";
import { getPosts } from "@/lib/posts/getPosts";
import styles from "./page.module.css";

export const revalidate = 60;

export default async function Home() {
  const [posts, popups] = await Promise.all([
    getPosts({ limit: HOME_POST_PAGE_SIZE + 1 }),
    getActiveNoticePopups().catch(() => []),
  ]);
  const initialPosts = posts.slice(0, HOME_POST_PAGE_SIZE);

  return (
    <>
      <HomeNoticePopups popups={popups} />
      {initialPosts.length > 0 ? (
        <main className={styles.main}>
          <HomePostList
            initialPosts={initialPosts}
            initialHasMore={posts.length > HOME_POST_PAGE_SIZE}
            pageSize={HOME_POST_PAGE_SIZE}
          />
        </main>
      ) : (
        <PreparingMessage />
      )}
    </>
  );
}
