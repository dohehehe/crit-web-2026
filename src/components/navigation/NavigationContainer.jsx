"use client";

import { useEffect, useRef } from "react";
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
  const navRef = useRef(null);

  useEffect(() => {
    if (!isNavOpen) {
      return undefined;
    }

    const media = window.matchMedia(
      `(max-width: ${getComputedStyle(document.documentElement).getPropertyValue("--breakpoint-mobile").trim() || "479px"})`,
    );
    const body = document.body;
    const html = document.documentElement;
    let lockedScrollY = 0;
    let locked = false;

    const lock = () => {
      if (locked || !media.matches) {
        return;
      }

      lockedScrollY = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${lockedScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      locked = true;
    };

    const unlock = () => {
      if (!locked) {
        return;
      }

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      const previousScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, lockedScrollY);
      html.style.scrollBehavior = previousScrollBehavior;
      locked = false;
    };

    const onTouchMove = (event) => {
      const nav = navRef.current;

      if (nav?.contains(event.target) && nav.scrollHeight > nav.clientHeight + 1) {
        return;
      }

      event.preventDefault();
    };

    const onMediaChange = () => {
      if (media.matches) {
        lock();
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        return;
      }

      document.removeEventListener("touchmove", onTouchMove);
      unlock();
    };

    onMediaChange();
    media.addEventListener("change", onMediaChange);

    return () => {
      media.removeEventListener("change", onMediaChange);
      document.removeEventListener("touchmove", onTouchMove);
      unlock();
    };
  }, [isNavOpen]);

  return (
    <nav
      ref={navRef}
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
