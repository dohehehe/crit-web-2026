"use client";

import { useLayoutEffect, useRef } from "react";
import { MOBILE_BREAKPOINT_QUERY } from "@/lib/routes/journalCrit";

export function AboutSectionNav({ className, children }) {
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const main = nav?.closest("main");
    const mobileQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);

    const update = () => {
      if (!nav) {
        return;
      }

      if (!mobileQuery.matches) {
        nav.style.top = "";
        main?.style.removeProperty("padding-top");
        return;
      }

      const sub = document.querySelector("[data-navigation-sub]");
      const top = sub ? sub.getBoundingClientRect().bottom : 0;

      nav.style.top = `${top}px`;
      main?.style.setProperty("padding-top", `${nav.offsetHeight}px`);
    };

    update();

    const header = document.querySelector("header");
    const observer = new ResizeObserver(update);

    if (header) {
      observer.observe(header);
    }

    observer.observe(nav);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    mobileQuery.addEventListener("change", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      mobileQuery.removeEventListener("change", update);
      nav.style.top = "";
      main?.style.removeProperty("padding-top");
    };
  }, []);

  return (
    <aside ref={navRef} className={className}>
      {children}
    </aside>
  );
}
