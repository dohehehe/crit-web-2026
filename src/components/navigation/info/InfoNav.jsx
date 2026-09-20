"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import { getInfoNavItems, isInfoNavActive } from "@/lib/navigation/infoNavItems";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import styles from "@/components/navigation/info/InfoNav.module.css";

export function InfoNav({ instagramHref, youtubeHref, isLoggedIn = false }) {
  const pathname = usePathname();
  const { isOpen, closeMenu, closeSearch } = useNavigationMenu();
  const navItems = getInfoNavItems(isLoggedIn);

  useEffect(() => {
    closeMenu();
    closeSearch();
  }, [pathname, closeMenu, closeSearch]);

  return (
    <div
      id="info-nav"
      className={`${styles.infoPanel}${isOpen ? ` ${styles.open}` : ""}`}
      aria-label="Info"
    >
      <ul className={styles.infoList}>
        {navItems.map((item) => {
          const isActive = isInfoNavActive(pathname, item.href);

          return (
            <li key={item.href} className={styles.item}>
              <Link
                href={item.href}
                className={`tag-keyword ${styles.infoLink}`}
                aria-label={isActive ? item.activeLabel : item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={closeMenu}
              >
                <span className={styles.labelStack} aria-hidden>
                  <span className={`${styles.labelEn} tag-keyword`}>{item.label}</span>
                  <span className={`${styles.labelKr} tag-keyword`}>{item.activeLabel}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {(instagramHref || youtubeHref) && (
        <div className={styles.infoSocial}>
          {instagramHref ? (
            <a
              className={styles.socialLink}
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon className={styles.socialIcon} />
            </a>
          ) : null}
          {youtubeHref ? (
            <a
              className={styles.socialLink}
              href={youtubeHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YoutubeIcon className={styles.socialIcon} />
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
