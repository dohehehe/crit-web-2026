"use client";

import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import styles from "@/components/navigation/Navigation.module.css";

export function NavButton() {
  const { isOpen, isSearchOpen, openMenu } = useNavigationMenu();

  if (isOpen || isSearchOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.menuButton}
      aria-expanded={isOpen}
      aria-controls="info-nav-panel"
      onClick={openMenu}
    >
      <span className={styles.menuButtonIcon} />
      <span className={styles.menuButtonIcon} />
      <span className={styles.menuButtonIcon} />
    </button>
  );
}
