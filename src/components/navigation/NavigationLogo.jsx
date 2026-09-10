"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/navigation/Navigation.module.css";

export function NavigationLogo() {
  const pathname = usePathname();
  const isJournalCrit = pathname.startsWith("/journal-crit");

  if (isJournalCrit) {
    return (
      <Link
        href="/"
        className={`${styles.logoLink} ${styles.logoLinkJournal}`}
        aria-label="CRIT 홈"
      >
        <Image
          src="/journal-crit-logo.svg"
          alt=""
          width={746}
          height={370}
          className={styles.logoJournal}
          priority
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={styles.logoLink} aria-label="CRIT 홈">
      <Image
        src="/logo-black.svg"
        alt=""
        width={400}
        height={129}
        className={styles.logo}
        priority
      />
    </Link>
  );
}
