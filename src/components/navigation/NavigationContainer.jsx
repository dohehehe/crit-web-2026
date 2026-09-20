"use client";

import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import styles from "@/components/navigation/Navigation.module.css";
import { InfoNav } from "@/components/navigation/info/InfoNav";
import { NavButton } from "@/components/navigation/NavButton";
import { NavCloseButton } from "@/components/navigation/NavCloseButton";
import { SearchNav } from "@/components/navigation/search/SearchNav";

export function NavigationContainer({
  children,
  instagramHref,
  youtubeHref,
  isLoggedIn = false,
}) {
  const { isOpen, isSearchOpen } = useNavigationMenu();
  const isNavOpen = isOpen || isSearchOpen;

  return (
    <nav
      className={`${styles.navContainer}${isNavOpen ? ` ${styles.open}` : ""}`}
      aria-expanded={isNavOpen}
    >
      <div className={styles.navContent}>
        {children}
        <InfoNav
          instagramHref={instagramHref}
          youtubeHref={youtubeHref}
          isLoggedIn={isLoggedIn}
        />
      </div>
      <div className={styles.navActions}>
        <SearchNav />
        <NavButton />
        <NavCloseButton />
      </div>
    </nav>
  );
}
