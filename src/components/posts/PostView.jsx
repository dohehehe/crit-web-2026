import Image from "next/image";
import Link from "next/link";
import { EditorContent } from "@/components/editor/EditorContent";
import { PostVideoEmbed } from "@/components/posts/PostVideoEmbed";
import { getSectionMode } from "@/lib/admin/section-mode";
import { getJournalCritIssuePath } from "@/lib/routes/journalCrit";
import { getPostPath } from "@/lib/routes/posts";
import styles from "./PostView.module.css";

export function PostView({ post, issue, issuePosts = [] }) {
  if (!post) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 게시물이 없습니다.</p>;
  }

  const isJournal = post.section && getSectionMode(post.section) === "journal";
  const isChannel = post.section && getSectionMode(post.section) === "channel";
  const showVideo = isChannel && post.videoUrl;
  const category = post.category?.name
    ? { id: post.category.id, name: post.category.name }
    : null;
  const keywords = post.keywords ?? [];
  const hasTags = category || keywords.length > 0;

  return (
    <>
      <article className={styles.article}>
        {showVideo ? (
          <PostVideoEmbed videoUrl={post.videoUrl} title={post.title} />
        ) : post.thumbnailImg ? (
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


      </article >
      <aside className={styles.aside}>
        {isJournal && issue?.fileUrl ? (
          <div className={`${styles.asideItem} menu-en`}>
            <a
              href={issue.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.asideButton} menu-en`}
            >
              PDF Download
            </a>
          </div>
        ) : null}

        {hasTags ? (
          <div className={`${styles.asideItem} menu-en`}>
            <div className={`${styles.asideTitle} menu-en`}>Tag</div>
            <ul className={styles.tagList}>
              {category ? (
                <li className={`${styles.tagItem} ${styles.tagCategory}`} key={`category-${category.id}`}>
                  <Link href={`/search?tag=category-${category.id}`}>{category.name}</Link>
                </li>
              ) : null}
              {keywords.map((keyword) => (
                <li className={styles.tagItem} key={keyword.id}>
                  <Link href={`/search?tag=${keyword.id}`}>{keyword.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {isJournal && issue ? (
          <div className={styles.asideItem}>
            <div className={`${styles.asideTitle} menu-en`}>
              {issue.issueNumber ? (
                <Link
                  href={getJournalCritIssuePath(issue.issueNumber)}

                >
                  Issue {issue.issueNumber} <br /> From This Issue
                </Link>
              ) : null}
            </div>
            {issuePosts.length ? (
              <ol className={styles.issuePostList}>
                {issuePosts.map((issuePost) => {
                  const isActive = issuePost.id === post.id;

                  return (
                    <li key={issuePost.id}>
                      {isActive ? (
                        <span
                          className={`${styles.issuePostItem} ${styles.issuePostItemActive} p-bold`}
                          aria-current="page"
                        >
                          {issuePost.title}
                        </span>
                      ) : (
                        <Link
                          href={getPostPath(issuePost, { issueNumber: issue.issueNumber })}
                          className={`${styles.issuePostItem} p-bold`}
                        >
                          {issuePost.title}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </div>
        ) : null}
      </aside>
    </>
  );
}
