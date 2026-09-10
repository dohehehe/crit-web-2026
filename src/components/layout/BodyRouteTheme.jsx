"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BODY_JOURNAL_CRIT_CLASS,
  isJournalCritPath,
} from "@/lib/routes/journalCrit";
import styles from "./BodyRouteTheme.module.css";

function applyJournalCritBackground() {
  document.body.classList.add(BODY_JOURNAL_CRIT_CLASS);
}

function clearJournalCritBackground() {
  document.body.classList.remove(BODY_JOURNAL_CRIT_CLASS);
}

export function BodyRouteTheme() {
  const pathname = usePathname();
  const isJournalCrit = isJournalCritPath(pathname);
  const wasJournalCritRef = useRef(isJournalCrit);
  const [showEnterFade, setShowEnterFade] = useState(false);

  useEffect(() => {
    const wasJournalCrit = wasJournalCritRef.current;
    wasJournalCritRef.current = isJournalCrit;

    if (!isJournalCrit && wasJournalCrit) {
      setShowEnterFade(false);
      clearJournalCritBackground();
      return;
    }

    if (isJournalCrit && !wasJournalCrit) {
      clearJournalCritBackground();
      setShowEnterFade(true);
      return;
    }

    if (isJournalCrit) {
      applyJournalCritBackground();
    }
  }, [isJournalCrit]);

  function handleEnterFadeEnd() {
    document.body.style.transition = "none";
    applyJournalCritBackground();
    requestAnimationFrame(() => {
      document.body.style.transition = "";
    });
    setShowEnterFade(false);
  }

  if (!showEnterFade) {
    return null;
  }

  return (
    <div
      className={styles.enterFade}
      aria-hidden="true"
      onAnimationEnd={handleEnterFadeEnd}
    />
  );
}
