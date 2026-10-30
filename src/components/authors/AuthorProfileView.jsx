import Image from "next/image";
import { EditorContent } from "@/components/editor/EditorContent";
import { PostList } from "@/components/posts/PostList";
import authorProseStyles from "./authorEditorProse.module.css";
import styles from "./AuthorProfileView.module.css";

export function AuthorProfileView({ author, posts = [] }) {
  if (!author) {
    return <p className={`caption gray-65`}>표시할 저자 정보가 없습니다.</p>;
  }

  return (
    <article className={styles.page}>
      <section className={styles.profileSection}>
        <div className={styles.profileTitleContainer}>
          {author.imgUrl ? (
            <Image
              src={author.imgUrl}
              alt={author.name ? `${author.name} profile` : ""}
              width={100}
              height={100}
              className={styles.profileImage}
              priority
            />
          ) : null}

          <div className={styles.profileTitle}>
            {author.name ? <h1 className={styles.name}>{author.name}</h1> : null}

            {author.email ? (
              <a href={`mailto:${author.email}`} className={styles.emailLink}>
                E. {author.email}
              </a>
            ) : null}
          </div>
        </div>

        {author.content ? (
          <section className={styles.content}>
            <EditorContent contents={author.content} proseStyles={authorProseStyles} />
          </section>
        ) : null}

      </section>



      <section className={styles.postsSection} aria-labelledby="author-posts-heading">
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <p className={`${styles.emptyPosts} caption gray-65`}>연결된 게시물이 없습니다.</p>
        )}
      </section>
    </article>
  );
}
