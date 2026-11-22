import { ChannelFeaturedCard } from "@/components/posts/ChannelFeaturedCard";
import { PostCard } from "@/components/posts/PostCard";
import { PreparingMessage } from "@/components/status/StatusMessage";
import styles from "./PostList.module.css";

function compareByDateDesc(a, b) {
  const dateA = a?.date || "";
  const dateB = b?.date || "";

  if (dateA !== dateB) {
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  }

  return String(b?.id ?? "").localeCompare(String(a?.id ?? ""));
}

export function PostList({
  posts,
  showSectionLabel = false,
  showWorkshopDate = false,
  showChannelFeatured = false,
}) {
  if (!posts?.length) {
    return <PreparingMessage />;
  }

  const orderedPosts = [...posts].sort(compareByDateDesc);
  const featuredPost = showChannelFeatured ? orderedPosts[0] : null;
  const listPosts = showChannelFeatured ? orderedPosts.slice(1) : orderedPosts;

  return (
    <div className={styles.frame}>
      <ul className={styles.list}>
        {featuredPost ? (
          <li className={styles.featured}>
            <ChannelFeaturedCard post={featuredPost} />
          </li>
        ) : null}
        {listPosts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              showSectionLabel={showSectionLabel}
              showWorkshopDate={showWorkshopDate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
