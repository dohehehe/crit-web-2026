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
      <header className={styles.header}>
        {backLink?.href ? (
          <Link href={backLink.href} className={`${styles.backLink} menu-EN`}>
            {backLink.label}
          </Link>
        ) : null}
        {post.title ? <h1 className={`title-1 ${styles.title}`}>{post.title}</h1> : null}
        {post.subtitle ? <p className={`p ${styles.subtitle}`}>{post.subtitle}</p> : null}
        {post.author?.name ? (
          <p className={`caption gray-65 ${styles.author}`}>{post.author.name}</p>
        ) : null}
      </header>

      {post.thumbnailImg ? (
        <section className={styles.media}>
          <div className={styles.thumbnail}>
            <Image
              src={post.thumbnailImg}
              alt={post.title ?? ""}
              width={0}
              height={0}
              sizes="(max-width: 500px) 100vw, 500px"
              className={styles.thumbnailImage}
              style={{ width: "100%", height: "auto" }}
              priority
            />
          </div>
        </section>
      ) : null}

      {post.content ? (
        <section className={styles.contents}>
          <EditorContent contents={post.content} />
        </section>
      ) : null}
    </article>
  );
}
