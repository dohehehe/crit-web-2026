import Image from "next/image";
import Link from "next/link";
import { EditorContent } from "@/components/editor/EditorContent";
import styles from "./JournalCritView.module.css";

export function JournalCritView({ issue, posts, previousIssues = [] }) {
  if (!issue) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 이슈가 없습니다.</p>;
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
                <li key={post.id} className={`p-bold ${styles.postItem}`}>
                  {post.title}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </article>

      {previousIssues.length ? (
        <aside className={styles.aside} aria-label="지난 이슈">
          <h3 className={`menu-en ${styles.asideTitle}`}>Past Issue</h3>
          <ol className={styles.asideList}>
            {previousIssues.map((pastIssue) => (
              <li key={pastIssue.id} className={styles.asideItem}>
                <Link href={`/journal-crit/${pastIssue.issueNumber}`} className={styles.asideLink}>
                  {pastIssue.issueNumber ? (
                    <span className={`${styles.asideIssueNumber} tag-keyword`}>Issue {pastIssue.issueNumber}</span>
                  ) : null}
                  {pastIssue.title ? (
                    <span className={`${styles.asideTitle} thumb-title`}>{pastIssue.title}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
          <div />
        </aside>
      ) : null}
    </>
  );
}
