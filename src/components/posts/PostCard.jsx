import Image from "next/image";
import Link from "next/link";
import { getSectionMode } from "@/lib/admin/section-mode";
import { isWorkshopClosed } from "@/lib/posts/isWorkshopClosed";
import { getPostPath } from "@/lib/routes/posts";
import styles from "./PostCard.module.css";

export function PostCard({
  post,
  showSectionLabel = false,
  showWorkshopDate = false,
}) {
  const { title, thumbnailImg, category, section, keywords, date } = post;
  const sectionMode = section ? getSectionMode(section) : null;
  const isJournalSection = sectionMode === "journal";
  const showClosedLabel = isWorkshopClosed(post);
  const workshopDate = showWorkshopDate && date ? date : null;

  return (
    <article className={styles.card}>
      <Link href={getPostPath(post)} className={styles.cardLink}>
        {showSectionLabel && section?.slug ? (
          <span
            className={`${styles.section} ${isJournalSection ? styles.sectionJournal : ""} tag-keyword white`}
          >
            <span className={styles.sectionSlug}>{section.slug}</span>
            {section.name ? (
              <span className={styles.sectionName}>{section.name}</span>
            ) : null}
          </span>
        ) : null}

        {thumbnailImg ? (
          <div
            className={`${styles.thumbnail} ${isJournalSection ? styles.thumbnailJournal : ""}`}
          >
            <Image
              src={thumbnailImg}
              alt=""
              width={0}
              height={0}
              sizes="(max-width: 520px) 100vw, (max-width: 1040px) 50vw, (max-width: 1560px) 33vw, (max-width: 2080px) 25vw, 20vw"
              className={styles.thumbnailImage}
            />
          </div>
        ) : (
          <div
            className={`${styles.thumbnail} ${styles.thumbnailPlaceholder}`}
          />
        )}

        {title ? (
          <h2
            className={`${styles.title} thumb-title${showClosedLabel ? ` ${styles.titleClosed}` : ""}`}
          >
            {title}
          </h2>
        ) : null}
      </Link>

      <div className={styles.meta}>
        {workshopDate ? (
          <div className={`${styles.workshopDate} black tag-keyword`}>{workshopDate}</div>
        ) : null}
        <ul className={styles.keywords} aria-label="키워드">
          {category?.name ? (
            <li className={`${styles.category} tag-category`}>
              {category.id ? (
                <Link href={`/search?tag=category-${category.id}`}>
                  {category.name}
                </Link>
              ) : (
                category.name
              )}
            </li>
          ) : null}
          {keywords.length > 0
            ? keywords.map((keyword) => (
              <li key={keyword.id} className="tag-keyword">
                {keyword.name}
              </li>
            ))
            : null}
        </ul>
      </div>
    </article>
  );
}
