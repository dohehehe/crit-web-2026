"use client";

import { useEffect, useRef } from "react";
import { useNavigationMenu } from "@/components/navigation/NavigationMenuContext";
import styles from "@/components/navigation/search/SearchNav.module.css";
import Image from "next/image";

export function SearchNav() {
  const { isOpen, isSearchOpen, openSearch } = useNavigationMenu();
  const inputRef = useRef(null);
  const isVisibleOnMobile = isOpen || isSearchOpen;

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <form
      className={`${styles.searchForm}${isSearchOpen ? ` ${styles.open}` : ""}${isVisibleOnMobile ? ` ${styles.visibleOnMobile}` : ""}`}
    >
      <input
        ref={inputRef}
        type="search"
        placeholder="검색어를 입력하세요..."
        className={styles.searchInput}
        tabIndex={isSearchOpen ? 0 : -1}
        aria-hidden={!isSearchOpen}
      />
      <button
        type="button"
        className={styles.searchButton}
        aria-label="검색 열기"
        aria-expanded={isSearchOpen}
        aria-controls="search-nav-content"
        onClick={openSearch}
      >
        <Image src="/search.svg" alt="" width={24} height={24} aria-hidden />
      </button>
    </form>
  );
}
