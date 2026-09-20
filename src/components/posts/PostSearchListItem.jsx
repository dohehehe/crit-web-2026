import Image from "next/image";
import Link from "next/link";
import { getSectionMode } from "@/lib/admin/section-mode";
import { getPostPath } from "@/lib/routes/posts";
import styles from "@/components/posts/PostSearch.module.css";

export function PostSearchListItem({ post }) {
  const { title, thumbnailImg, date, author, section, category, keywords } = post;
  const isJournalSection = section && getSectionMode(section) === "journal";

  return (
    <Link href={getPostPath(post)} className={styles.itemLink}>
      <article className={styles.item}>
        {thumbnailImg ? (
          <div
            className={`${styles.thumbnail} ${isJournalSection ? styles.thumbnailJournal : ""}`}
          >
            <Image
              src={thumbnailImg}
              alt=""
              width={160}
              height={100}
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
        ) : (
          <div className={`${styles.thumbnail} ${styles.thumbnailPlaceholder}`} aria-hidden />
        )}

        <div className={styles.body}>
          {title ? <h2 className={`${styles.title} thumb-title`}>{title}</h2> : null}

          <div className={styles.metaRow}>
            {date ? <time className={`${styles.date} caption gray-65`}>{date}</time> : null}
            {author?.name ? (
              <span className={`${styles.author} caption tag-keyword`}>{author.name}</span>
            ) : null}
          </div>



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
        </div>
      </article>
    </Link>
  );
}
