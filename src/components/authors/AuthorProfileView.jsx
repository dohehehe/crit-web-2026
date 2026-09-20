import Image from "next/image";
import { EditorContent } from "@/components/editor/EditorContent";
import { PostList } from "@/components/posts/PostList";
import styles from "./AuthorProfileView.module.css";

export function AuthorProfileView({ author, posts = [] }) {
  if (!author) {
    return <p className={`caption gray-65`}>표시할 저자 정보가 없습니다.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {author.imgUrl ? (
          <Image
            src={author.imgUrl}
            alt={author.name ? `${author.name} profile` : ""}
            width={0}
            height={0}
            sizes="(max-width: 479px) 100%, 320px"
            className={styles.profileImage}
            style={{ width: "100%", height: "auto" }}
            priority
          />
        ) : null}
        {author.name ? <h1 className={`title-1 ${styles.name}`}>{author.name}</h1> : null}
        {author.email ? (
          <a href={`mailto:${author.email}`} className={`menu-en ${styles.emailLink}`}>
            {author.email}
          </a>
        ) : null}
        {author.content ? (
          <section className={styles.content}>
            <EditorContent contents={author.content} />
          </section>
        ) : null}

      </header>



      <section className={styles.postsSection} aria-labelledby="author-posts-heading">
        <h2 id="author-posts-heading" className={`menu-en ${styles.postsTitle}`}>
          Posts
        </h2>
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <p className={`${styles.emptyPosts} caption gray-65`}>연결된 게시물이 없습니다.</p>
        )}
      </section>
    </div>
  );
}
