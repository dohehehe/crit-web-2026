import Image from "next/image";
import Link from "next/link";
import { EditorContent } from "@/components/editor/EditorContent";
import { getPostBackLink } from "@/lib/routes/posts";
import styles from "./PostView.module.css";

export function PostView({ post }) {
  if (!post) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 게시물이 없습니다.</p>;
  }

  const backLink = getPostBackLink(post);

  return (
    <article className={styles.article}>
      {post.thumbnailImg ? (
        <section className={styles.thumbnailSection}>
          <div className={styles.thumbnail}>
            <Image
              src={post.thumbnailImg}
              alt={post.title ?? ""}
              width={0}
              height={0}
              sizes="100vw"
              className={styles.thumbnailImage}
              priority
            />
          </div>
        </section>
      ) : null}

      <header className={styles.header}>
        {post.title ? <h1 className={`title-1 ${styles.title}`}>{post.title}</h1> : null}
        {post.subtitle ? <h2 className={`thumb-title ${styles.subtitle}`}>{post.subtitle}</h2> : null}
        <div className={styles.infoContainer}>
          {post.author?.name ? (
            <p className={`tag-keyword black ${styles.author}`}>{post.author.name}</p>
          ) : null}
          {post.date ? (
            <p className={`tag-keyword gray-65 ${styles.date}`}>{post.date}</p>
          ) : null}
        </div>
      </header>



      {post.content ? (
        <section className={styles.contents}>
          <EditorContent contents={post.content} />
        </section>
      ) : null}
    </article>
  );
}
