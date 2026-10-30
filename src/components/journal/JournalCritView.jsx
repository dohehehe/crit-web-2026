import Image from "next/image";
import Link from "next/link";
import { EditorContent } from "@/components/editor/EditorContent";
import { PreparingMessage } from "@/components/status/StatusMessage";
import { formatAuthorNames } from "@/lib/posts/formatAuthorNames";
import { getJournalCritIssuePath } from "@/lib/routes/journalCrit";
import { getPostPath } from "@/lib/routes/posts";
import styles from "./JournalCritView.module.css";

export function JournalCritView({ issue, posts, otherIssues = [] }) {
  if (!issue) {
    return <PreparingMessage />;
  }

  return (
    <>
      <article className={styles.article}>
        <header className={styles.header}>
          {issue.issueNumber ? <span className={`${styles.issueNumber} menu-EN`}>Issue {issue.issueNumber}</span> : null}
          {issue.title ? <h1 className={`title-1 ${styles.title}`}>{issue.title}</h1> : null}
        </header>

        <section className={styles.media}>
          {issue.coverImg ? (
            <div className={styles.cover}>
              <Image
                src={issue.coverImg}
                alt={issue.title ?? ""}
                width={0}
                height={0}
                sizes="(max-width: 500px) 100vw, 500px"
                className={styles.coverImage}
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          ) : null}
          {issue.fileUrl ? (
            <div className={styles.download}>
              <a href={issue.fileUrl} target="_blank" rel="noopener noreferrer" className={`tag-keyword`}>
                PDF 다운로드
              </a>
            </div>
          ) : null}
        </section>


        {issue.contents ? (
          <section className={styles.contents}>
            <EditorContent contents={issue.contents} />
          </section>
        ) : null}

        {posts?.length ? (
          <section className={styles.posts} aria-label="이슈 게시물">
            <h3 className={`tag-keyword ${styles.postsTitle}`}>Contents</h3>
            <ol className={styles.postList}>
              {posts.map((post) => (
                <li key={post.id} className={styles.postItem}>
                  <Link
                    href={getPostPath(post, { issueNumber: issue.issueNumber })}
                    className={`${styles.postLink}`}
                  >
                    {/* <hr className={styles.postSeparator} /> */}
                    <span className={`${styles.title} thumb-title`}>{post.title}</span>
                    {/* <hr className={styles.postSeparator} /> */}
                    {formatAuthorNames(post) ? (
                      <span className={`${styles.author} p`}>{formatAuthorNames(post)}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </article>

      {otherIssues.length ? (
        <aside className={styles.aside} aria-label="다른 이슈">
          <h3 className={`menu-en ${styles.asideHeading}`}>Other Issues</h3>
          <ol className={styles.asideList}>
            {otherIssues.map((otherIssue) => (
              <li key={otherIssue.id} className={styles.asideItem}>
                <Link href={getJournalCritIssuePath(otherIssue.issueNumber)} className={styles.asideLink}>
                  {otherIssue.issueNumber ? (
                    <span className={`${styles.asideIssueNumber} tag-keyword`}>Issue {otherIssue.issueNumber}</span>
                  ) : null}
                  {otherIssue.title ? (
                    <span className={`${styles.asideIssueTitle} thumb-title`}>{otherIssue.title}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
          <div className={styles.asideBlank}></div>
        </aside>
      ) : null}
    </>
  );
}
