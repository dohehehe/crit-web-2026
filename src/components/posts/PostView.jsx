import Image from "next/image";
import Link from "next/link";
import { EditorContent } from "@/components/editor/EditorContent";
import { PostVideoEmbed } from "@/components/posts/PostVideoEmbed";
import { getSectionMode } from "@/lib/admin/section-mode";
import { getJournalCritIssuePath } from "@/lib/routes/journalCrit";
import {
  formatAuthorNames,
  getPostAuthors,
} from "@/lib/posts/formatAuthorNames";
import { getAuthorPath } from "@/lib/routes/authors";
import { getPostPath } from "@/lib/routes/posts";
import styles from "./PostView.module.css";

function PostAuthorNames({ post, className }) {
  const authors = getPostAuthors(post);
  if (authors.length === 0) {
    return null;
  }

  return (
    <p className={className}>
      {authors.map((author, index) => (
        <span key={author.id ?? `${author.name}-${index}`}>
          {index > 0 ? ", " : null}{author.id ? (
            <Link href={getAuthorPath(author)} className={styles.authorLink}>
              {author.name}
            </Link>
          ) : (
            author.name
          )}
        </span>
      ))}
    </p>
  );
}

function AuthorAside({ authors }) {
  const cards = authors.filter((author) => author.imgUrl || author.description);

  return (
    <div className={styles.authorContainer}>
      <ul className={styles.authorNameList}>
        {authors.map((author, index) => (
          <li
            key={author.id ?? `${author.name}-${index}`}
            className={styles.authorNameItem}
          >
            {author.id ? (
              <Link href={getAuthorPath(author)}>{author.name}</Link>
            ) : (
              author.name
            )}
          </li>
        ))}
      </ul>
      {cards.length > 0 ? (
        <ul className={styles.authorCardList}>
          {cards.map((author, index) => {
            const card = (
              <>
                {author.imgUrl ? (
                  <Image
                    src={author.imgUrl}
                    alt=""
                    width={100}
                    height={100}
                    className={styles.authorCardImage}
                  />
                ) : null}
                {author.description ? (
                  <p className={`${styles.authorCardDescription}`}>
                    {author.description}
                  </p>
                ) : null}
              </>
            );

            return (
              <li
                key={author.id ?? `${author.name}-${index}`}
                className={styles.authorCardItem}
              >
                {author.id ? (
                  <Link href={getAuthorPath(author)} className={styles.authorCardLink}>
                    {card}
                  </Link>
                ) : (
                  <div className={styles.authorCardLink}>{card}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

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
            <PostAuthorNames
              post={post}
              className={`tag-keyword black ${styles.author}`}
            />
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

        {getPostAuthors(post).length > 0 ? (
          <div className={styles.asideItem}>
            <div className={`${styles.asideTitle} menu-en`}>Author</div>
            <AuthorAside authors={getPostAuthors(post)} />
          </div>
        ) : null}

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
                      {formatAuthorNames(issuePost) ? (
                        <span className={`${styles.issuePostAuthor} p`}>
                          {formatAuthorNames(issuePost)}
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
