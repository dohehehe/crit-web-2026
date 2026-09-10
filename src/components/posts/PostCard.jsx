import Image from "next/image";
import Link from "next/link";
import { getSectionMode } from "@/lib/admin/section-mode";
import { getPostPath } from "@/lib/routes/posts";
import styles from "./PostCard.module.css";

export function PostCard({ post }) {
  const { title, thumbnailImg, category, section, keywords } = post;
  const isJournalSection = section && getSectionMode(section) === "journal";

  return (
    <Link href={getPostPath(post)} className={styles.cardLink}>
    <article className={styles.card}>
      {section?.slug ? (
        <span
          className={`${styles.section} ${isJournalSection ? styles.sectionJournal : ""} tag-keyword white`}
        >
          <span className={styles.sectionSlug}>{section.slug}</span>
          {section.name ? <span className={styles.sectionName}>{section.name}</span> : null}
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
            sizes="(max-width: 479px) 100vw, (max-width: 719px) 50vw, 600px"
            className={styles.thumbnailImage}
          />
        </div>
      ) : (
        <div className={`${styles.thumbnail} ${styles.thumbnailPlaceholder}`} />
      )}

      {title ? <h2 className={`${styles.title} thumb-title`}>{title}</h2> : null}

      <div className={styles.meta}>
        <ul className={styles.keywords} aria-label="키워드">
          {category?.name ? (
            <li className={`${styles.category} tag-category`}>{category.name}</li>
          ) : null}
          {keywords.length > 0 ? (

            keywords.map((keyword) => (
              <li key={keyword.id} className="tag-keyword">
                {keyword.name}
              </li>
            ))

          ) : null}
        </ul>
      </div>



    </article>
    </Link>
  );
}
