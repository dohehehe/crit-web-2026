"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JOURNAL_CRIT_PATH_PREFIX, isJournalCritPath } from "@/lib/routes/journalCrit";
import styles from "@/components/navigation/Navigation.module.css";

export function NavigationLogo() {
  const pathname = usePathname();
  const isJournalCrit = isJournalCritPath(pathname);

  return (
    <Link
      href={isJournalCrit ? JOURNAL_CRIT_PATH_PREFIX : "/"}
      className={`${styles.logoLink}${isJournalCrit ? ` ${styles.logoLinkJournal}` : ""}`}
      aria-label={isJournalCrit ? "Journal Crit" : "CRIT 홈"}
    >
      <span className={styles.logoStack}>
        <Image
          src="/logo-black.svg"
          alt=""
          width={400}
          height={129}
          className={`${styles.logo} ${styles.logoDefault} ${isJournalCrit ? styles.logoHidden : styles.logoVisible}`}
          priority
        />
        <Image
          src="/journal-crit-logo.svg"
          alt=""
          width={746}
          height={370}
          className={`${styles.logoJournal} ${isJournalCrit ? styles.logoVisible : styles.logoHidden}`}
          priority
        />
      </span>
    </Link>
  );
}
