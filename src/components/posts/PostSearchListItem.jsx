import Image from "next/image";
import Link from "next/link";
import { getSectionMode } from "@/lib/admin/section-mode";
import styles from "@/components/posts/PostSearch.module.css";

export function PostSearchListItem({ entry }) {
  const {
    href,
    title,
    thumbnailImg,
    date,
    authorName,
    section,
    category,
    keywords,
    showThumbnailPlaceholder,
    excerpt,
  } = entry;

  const isJournalSection = section && getSectionMode(section) === "journal";
  const hasMeta = Boolean(date || authorName);
  const hasKeywords = Boolean(category?.name || keywords?.length);

  return (
    <Link href={href} className={styles.itemLink}>
      <article className={styles.item}>
        {thumbnailImg ? (
          <div
            className={`${styles.thumbnail} ${isJournalSection ? styles.thumbnailJournal : ""}`}
          >
            <Image
              src={thumbnailImg}
              alt=""
              fill
              sizes="160px"
              className={styles.thumbnailImage}
            />
            {section?.slug ? (
              <p className={styles.sections} aria-label="섹션">
                <span
                  className={`${styles.sectionTag} ${isJournalSection ? styles.sectionJournal : ""} caption white`}
                >
                  <span className={styles.sectionSlug}>{section.slug}</span>
                  {section.name ? (
                    <span className={styles.sectionName}>{section.name}</span>
                  ) : null}
                </span>
              </p>
            ) : null}
          </div>
        ) : showThumbnailPlaceholder ? (
          <div className={`${styles.thumbnail} ${styles.thumbnailPlaceholder}`} aria-hidden />
        ) : null}

        <div className={styles.body}>
          {title ? <h2 className={`${styles.title} thumb-title`}>{title}</h2> : null}

          {hasMeta ? (
            <div className={styles.metaRow}>
              {date ? <time className={`${styles.date} caption gray-65`}>{date}</time> : null}
              {authorName ? (
                <span className={`${styles.author} caption`}>{authorName}</span>
              ) : null}
            </div>
          ) : null}

          {excerpt ? <p className={`${styles.excerpt} caption gray-65`}>{excerpt}</p> : null}

          {hasKeywords ? (
            <ul className={styles.keywords} aria-label="키워드">
              {category?.name ? (
                <li className={`${styles.category} tag-category`}>{category.name}</li>
              ) : null}
              {keywords?.length
                ? keywords.map((keyword) => (
                  <li key={keyword.id} className="tag-keyword">
                    {keyword.name}
                  </li>
                ))
                : null}
            </ul>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
