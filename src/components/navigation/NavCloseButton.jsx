"use client";

import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import styles from "@/components/navigation/Navigation.module.css";
import Image from "next/image";

export function NavCloseButton() {
  const { isOpen, closeMenu, isSearchOpen, closeSearch } = useNavigationMenu();

  if (!isOpen && !isSearchOpen) {
    return null;
  }

  const handleClose = () => {
    if (isSearchOpen) {
      closeSearch();
      return;
    }

    closeMenu();
  };

  return (
    <button
      type="button"
      className={`${styles.closeButton}${isSearchOpen ? ` ${styles.closeButtonSearchOpen}` : ""} menu-en`}
      aria-label={isSearchOpen ? "검색 닫기" : "메뉴 닫기"}
      onClick={handleClose}
    >
      <Image src="/close.svg" alt="Close" width={32} height={32} />
    </button>
  );
}
