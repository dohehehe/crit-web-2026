import Image from "next/image";
import Link from "next/link";
import { EditorContent } from "@/components/editor/EditorContent";
import { PostVideoEmbed } from "@/components/posts/PostVideoEmbed";
import { getSectionMode } from "@/lib/admin/section-mode";
import { getJournalCritIssuePath } from "@/lib/routes/journalCrit";
import { getAuthorPath } from "@/lib/routes/authors";
import { getPostPath } from "@/lib/routes/posts";
import styles from "./PostView.module.css";

function PostAsideBanner({ banner }) {
  if (!banner?.imgUrl) {
    return null;
  }

  const content = (
    <div className={styles.banner}>
      <Image
        src={banner.imgUrl}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={styles.bannerImage}
      />
    </div>
  );

  if (banner.linkUrl) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.bannerLink}
      >
        {content}
      </a>
    );
  }

  return content;
}

export function PostView({ post, issue, issuePosts = [], banner = null }) {
  if (!post) {
    return (
      <p className={`${styles.empty} caption gray-65`}>
        표시할 게시물이 없습니다.
      </p>
    );
  }

  const isJournal = post.section && getSectionMode(post.section) === "journal";
  const isChannel = post.section && getSectionMode(post.section) === "channel";
  const showVideo = isChannel && post.videoUrl;
  const category = post.category?.name
    ? { id: post.category.id, name: post.category.name }
    : null;
  const keywords = post.keywords ?? [];
  const hasTags = category || keywords.length > 0;
  const otherIssuePosts = issuePosts.filter(
    (issuePost) => issuePost.id !== post.id,
  );

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
          {post.title ? (
            <h1 className={`title-1 ${styles.title}`}>{post.title}</h1>
          ) : null}
          {post.subtitle ? (
            <h2 className={`thumb-title ${styles.subtitle}`}>
              {post.subtitle}
            </h2>
          ) : null}
          <div className={styles.infoContainer}>
            {post.author?.name ? (
              post.author.id ? (
                <Link
                  href={getAuthorPath(post.author)}
                  className={`tag-keyword black ${styles.author} ${styles.authorLink}`}
                >
                  {post.author.name}
                </Link>
              ) : (
                <p className={`tag-keyword black ${styles.author}`}>
                  {post.author.name}
                </p>
              )
            ) : null}
            {post.date ? (
              <p className={`tag-keyword gray-65 ${styles.date}`}>
                {post.date}
              </p>
            ) : null}
          </div>
        </header>

        {post.content ? (
          <section className={styles.contents}>
            <EditorContent contents={post.content} />
          </section>
        ) : null}
      </article>
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
                <li
                  className={`${styles.tagItem} ${styles.tagCategory}`}
                  key={`category-${category.id}`}
                >
                  <Link href={`/search?tag=category-${category.id}`}>
                    {category.name}
                  </Link>
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

        <div className={styles.asideItem}>
          <div className={`${styles.asideTitle} menu-en`}>Author</div>
          <div className={styles.authorContainer}>
            <ul className={styles.authorNameList}>
              <li className={styles.authorNameItem}>
                <Link href={getAuthorPath(post.author)}>
                  {post.author.name}
                </Link>
              </li>
            </ul>
            <ul className={styles.authorCardList}>
              <li className={styles.authorCardItem}>
                <Link href={getAuthorPath(post.author)}>
                  {post.author.name}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {isJournal && issue ? (
          <div className={styles.asideItem}>
            <div className={`${styles.asideTitle} menu-en`}>
              {issue.issueNumber ? (
                <Link href={getJournalCritIssuePath(issue.issueNumber)}>
                  Issue {issue.issueNumber} <br /> From This Issue
                </Link>
              ) : null}
            </div>
            {otherIssuePosts.length ? (
              <ol className={styles.issuePostList}>
                {otherIssuePosts.map((issuePost) => (
                  <li key={issuePost.id}>
                    <Link
                      href={getPostPath(issuePost, {
                        issueNumber: issue.issueNumber,
                      })}
                      className={`${styles.issuePostItem} p-bold`}
                    >
                      <span className={`${styles.issuePostTitle} thumb-title`}>{issuePost.title}</span>
                      {issuePost.author?.name ? (
                        <span className={`${styles.issuePostAuthor} p`}>
                          {issuePost.author.name}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}

        <PostAsideBanner banner={banner} />
      </aside>
    </>
  );
}
