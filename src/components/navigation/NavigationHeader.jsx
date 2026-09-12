"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isJournalCritOrangeBackgroundPath,
  isJournalCritPath,
  JOURNAL_ISSUE_BACKGROUND_CLASS,
  JOURNAL_MOBILE_HEADER_OFFSET_VAR,
  MOBILE_BREAKPOINT_QUERY,
} from "@/lib/routes/journalCrit";
import { CHANNEL_BACKGROUND_CLASS, isChannelPath } from "@/lib/routes/channel";
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

function useJournalMobileHeaderOffset(headerRef, enabled) {
  useLayoutEffect(() => {
    const root = document.documentElement;

    if (!enabled) {
      root.style.removeProperty(JOURNAL_MOBILE_HEADER_OFFSET_VAR);
      return undefined;
    }

    const mobileQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);

    const updateOffset = () => {
      const header = headerRef.current;

      if (!mobileQuery.matches || !header) {
        root.style.removeProperty(JOURNAL_MOBILE_HEADER_OFFSET_VAR);
        return;
      }

      root.style.setProperty(
        JOURNAL_MOBILE_HEADER_OFFSET_VAR,
        `${header.offsetHeight}px`,
      );
    };

    updateOffset();

    const observer = new ResizeObserver(updateOffset);
    const header = headerRef.current;

    if (header) {
      observer.observe(header);

      const logoLink = header.firstElementChild;

      if (logoLink) {
        observer.observe(logoLink);
        logoLink.querySelectorAll("img").forEach((image) => observer.observe(image));
      }
    }

    mobileQuery.addEventListener("change", updateOffset);
    window.addEventListener("resize", updateOffset);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener("change", updateOffset);
      window.removeEventListener("resize", updateOffset);
      root.style.removeProperty(JOURNAL_MOBILE_HEADER_OFFSET_VAR);
    };
  }, [enabled, headerRef]);
}

export function NavigationHeader({ children }) {
  const pathname = usePathname();
  const isJournalCrit = isJournalCritPath(pathname);
  const isChannel = isChannelPath(pathname);
  const useIssueBackground = isJournalCritOrangeBackgroundPath(pathname);
  const headerRef = useRef(null);
  const stickyTop = useJournalStickyTop(headerRef, isJournalCrit);

  useJournalMobileHeaderOffset(headerRef, isJournalCrit);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(
      JOURNAL_ISSUE_BACKGROUND_CLASS,
      useIssueBackground,
    );
    document.body.classList.toggle(
      JOURNAL_ISSUE_BACKGROUND_CLASS,
      useIssueBackground,
    );
    document.documentElement.classList.toggle(
      CHANNEL_BACKGROUND_CLASS,
      isChannel,
    );
    document.body.classList.toggle(
      CHANNEL_BACKGROUND_CLASS,
      isChannel,
    );
  }, [useIssueBackground, isChannel]);

  const style =
    isJournalCrit && stickyTop !== null
      ? { "--header-sticky-top": `${stickyTop}px` }
      : undefined;

  return (
    <header
      ref={headerRef}
      className={`${styles.header}${isJournalCrit ? ` ${styles.headerJournal}` : ""}${isChannel ? ` ${styles.headerChannel}` : ""}`}
      style={style}
    >
      {children}
    </header>
  );
}
