"use client";

import { useEffect, useId, useRef } from "react";
import styles from "@/components/auth/AlertDialog.module.css";

export function AlertDialog({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = null,
  onConfirm,
  onCancel = null,
}) {
  const titleId = useId();
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    confirmRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        (onCancel ?? onConfirm)?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={`menu-kr ${styles.title}`}>
          {title}
        </h2>
        <p className={`p ${styles.message}`}>{message}</p>
        <div className={styles.actions}>
          {cancelLabel && onCancel ? (
            <button
              type="button"
              className={`tag-keyword ${styles.cancelButton}`}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            ref={confirmRef}
            type="button"
            className={`tag-keyword ${styles.button} ${styles.buttonPrimary}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
