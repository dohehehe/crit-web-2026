import Image from "next/image";
import Link from "next/link";
import { getPostPath } from "@/lib/routes/posts";
import styles from "./ChannelFeaturedCard.module.css";

export function ChannelFeaturedCard({ post }) {
  if (!post) {
    return null;
  }

  const { title, description, thumbnailImg, category, keywords = [] } = post;
  const trimmedDescription =
    typeof description === "string" ? description.trim() : "";

  return (
    <article className={styles.card}>
      <Link href={getPostPath(post)} className={styles.cardLink}>
        {thumbnailImg ? (
          <div className={styles.thumbnail}>
            <Image
              src={thumbnailImg}
              alt=""
              width={0}
              height={0}
              sizes="100vw"
              className={styles.thumbnailImage}
              priority
            />
          </div>
        ) : (
          <div
            className={`${styles.thumbnail} ${styles.thumbnailPlaceholder}`}
          />
        )}

        <div className={styles.body}>
          {title ? (
            <h2 className={`title-1 ${styles.title}`}>{title}</h2>
          ) : null}

          <div className={styles.meta}>
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
              {keywords.map((keyword) => (
                <li key={keyword.id} className="tag-keyword">
                  {keyword.name}
                </li>
              ))}
            </ul>
          </div>

          {trimmedDescription ? (
            <p className={`p ${styles.description}`}>{trimmedDescription}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
