import { ChannelFeaturedCard } from "@/components/posts/ChannelFeaturedCard";
import { PostCard } from "@/components/posts/PostCard";
import styles from "./PostList.module.css";

export function PostList({
  posts,
  showSectionLabel = false,
  showWorkshopDate = false,
  showChannelFeatured = false,
}) {
  if (!posts?.length) {
    return (
      <p className={`${styles.empty} caption gray-65`}>게시물이 없습니다.</p>
    );
  }

  const featuredPost = showChannelFeatured ? posts[0] : null;
  const listPosts = showChannelFeatured ? posts.slice(1) : posts;

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
