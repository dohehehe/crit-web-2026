"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "./TopLoadingBar.module.css";

const SHOW_DELAY_MS = 120;
const HIDE_DELAY_MS = 280;
const SAFETY_MS = 10000;

function readHeader(input, init, name) {
  const source =
    init?.headers ?? (input instanceof Request ? input.headers : undefined);

  if (!source) {
    return null;
  }

  if (typeof Headers !== "undefined" && source instanceof Headers) {
    return source.get(name);
  }

  if (Array.isArray(source)) {
    const match = source.find(
      ([key]) => String(key).toLowerCase() === name,
    );
    return match ? String(match[1]) : null;
  }

  const value = source[name];
  return value == null ? null : String(value);
}

function isNavigationFetch(input, init) {
  if (readHeader(input, init, "next-router-prefetch")) {
    return false;
  }

  if (readHeader(input, init, "next-router-segment-prefetch")) {
    return false;
  }

  if (readHeader(input, init, "next-hmr-refresh")) {
    return false;
  }

  return readHeader(input, init, "rsc") === "1";
}

function isModifiedClick(event) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function toSameOriginUrl(value) {
  try {
    const url = new URL(value, window.location.href);

    if (url.origin !== window.location.origin) {
      return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function isCurrentLocation(url) {
  return (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  );
}

function navigationUrlFromAnchor(anchor) {
  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  if (anchor.hasAttribute("download")) {
    return null;
  }

  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return null;
  }

  const url = toSameOriginUrl(anchor.href);

  if (!url || isCurrentLocation(url)) {
    return null;
  }

  return url;
}

function Bar({ done }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setStarted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`${styles.bar}${started ? ` ${styles.grow}` : ""}${done ? ` ${styles.done}` : ""}`}
    />
  );
}

function TopLoadingBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [status, setStatus] = useState("off");
  const finishRef = useRef(() => {});
  const skipRouteEffectRef = useRef(true);

  useEffect(() => {
    if (skipRouteEffectRef.current) {
      skipRouteEffectRef.current = false;
      return;
    }

    finishRef.current();
  }, [pathname, query]);

  useEffect(() => {
    const statusRef = { current: "off" };
    let inflight = 0;
    let showTimer = 0;
    let hideTimer = 0;
    let safetyTimer = 0;
    let showPending = false;
    const originalFetch = window.fetch;

    const setBarStatus = (nextStatus) => {
      statusRef.current = nextStatus;
      setStatus(nextStatus);
    };

    const finish = () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(safetyTimer);
      showPending = false;
      inflight = 0;

      if (statusRef.current !== "on") {
        setBarStatus("off");
        return;
      }

      setBarStatus("done");
      hideTimer = window.setTimeout(() => {
        setBarStatus("off");
      }, HIDE_DELAY_MS);
    };

    const begin = () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(finish, SAFETY_MS);

      if (statusRef.current === "done") {
        setBarStatus("on");
        return;
      }

      if (statusRef.current === "on" || showPending) {
        return;
      }

      showPending = true;
      showTimer = window.setTimeout(() => {
        showPending = false;

        if (statusRef.current === "off") {
          setBarStatus("on");
        }
      }, SHOW_DELAY_MS);
    };

    finishRef.current = finish;

    const onClick = (event) => {
      if (isModifiedClick(event)) {
        return;
      }

      const anchor =
        event.target instanceof Element ? event.target.closest("a") : null;

      if (!anchor || !navigationUrlFromAnchor(anchor)) {
        return;
      }

      begin();
    };

    const onSubmit = (event) => {
      if (event.defaultPrevented) {
        return;
      }

      const form = event.target;

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      if (form.target && form.target !== "_self") {
        return;
      }

      const url = toSameOriginUrl(form.action || window.location.href);

      if (!url) {
        return;
      }

      begin();
    };

    const onPopState = () => {
      begin();
    };

    window.fetch = function patchedFetch(input, init) {
      const track = isNavigationFetch(input, init);

      if (track) {
        inflight += 1;
        begin();
      }

      const request = originalFetch.call(this, input, init);

      if (track) {
        request.then(
          () => {
            inflight = Math.max(0, inflight - 1);
          },
          () => {
            inflight = Math.max(0, inflight - 1);

            if (inflight === 0) {
              finish();
            }
          },
        );
      }

      return request;
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit);
    window.addEventListener("popstate", onPopState);

    return () => {
      finishRef.current = () => {};
      window.fetch = originalFetch;
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(safetyTimer);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  if (status === "off") {
    return null;
  }

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label="페이지를 불러오는 중"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={status === "done" ? 100 : undefined}
    >
      <Bar done={status === "done"} />
    </div>
  );
}

export function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarInner />
    </Suspense>
  );
}
