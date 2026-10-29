import Image from "next/image";
import Link from "next/link";
import styles from "@/components/posts/PostSearch.module.css";

export function PostSearchList({ entries }) {
  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <li key={entry.key}>
          <Link href={entry.href} className={styles.itemLink}>
            <article className={styles.item}>
              {entry.thumbnailImg ? (
                <div className={styles.thumbnail}>
                  <Image
                    src={entry.thumbnailImg}
                    alt=""
                    fill
                    sizes="160px"
                    className={styles.thumbnailImage}
                  />
                </div>
              ) : null}

              <div className={styles.body}>
                {entry.title ? (
                  <h2 className={`${styles.title} thumb-title`}>{entry.title}</h2>
                ) : null}
                {entry.excerpt ? (
                  <p className={`${styles.excerpt} caption gray-65`}>{entry.excerpt}</p>
                ) : null}
              </div>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
