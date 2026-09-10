"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/navigation/Navigation.module.css";

function useJournalStickyTop(headerRef, enabled) {
  const [stickyTop, setStickyTop] = useState(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setStickyTop(null);
      return;
    }

    const header = headerRef.current;
    if (!header) {
      return;
    }

    const updateStickyTop = () => {
      const nav = header.querySelector("nav");
      if (!nav) {
        return;
      }

      setStickyTop(-nav.offsetTop);
    };

    updateStickyTop();

    const observer = new ResizeObserver(updateStickyTop);
    observer.observe(header);

    const logo = header.firstElementChild;
    if (logo) {
      observer.observe(logo);
    }

    const logoImg = logo?.querySelector("img");
    if (logoImg) {
      observer.observe(logoImg);
    }

    const nav = header.querySelector("nav");
    if (nav) {
      observer.observe(nav);
    }

    window.addEventListener("resize", updateStickyTop);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateStickyTop);
    };
  }, [enabled, headerRef]);

  return stickyTop;
}

export function NavigationHeader({ children }) {
  const pathname = usePathname();
  const isJournalCrit = pathname.startsWith("/journal-crit");
  const headerRef = useRef(null);
  const stickyTop = useJournalStickyTop(headerRef, isJournalCrit);

  const style =
    isJournalCrit && stickyTop !== null
      ? { "--header-sticky-top": `${stickyTop}px` }
      : undefined;

  return (
    <header
      ref={headerRef}
      className={`${styles.header}${isJournalCrit ? ` ${styles.headerJournal}` : ""}`}
      style={style}
    >
      {children}
    </header>
  );
}
