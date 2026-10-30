"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/auth/AlertDialog";
import { SUBSCRIBER_ONLY_ALERT } from "@/lib/auth/constants";
import {
  ISSUE_FILE_BUCKET,
  ISSUE_FILE_MIME,
} from "@/lib/issueUpload/constants";
import { issueFileName, parseIssueStoragePath } from "@/lib/issueUpload/fileRef";
import { createClient } from "@/lib/supabase/browser";
import styles from "./IssuePdfLink.module.css";

async function readLoggedIn() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

function openPdfTab(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function savePdfFile(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function IssuePdfLink({ fileUrl, className, children }) {
  const router = useRouter();
  const storagePath = parseIssueStoragePath(fileUrl);
  const blobUrlRef = useRef(null);
  const loadingRef = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    readLoggedIn()
      .then((loggedIn) => {
        if (!cancelled) {
          setIsLoggedIn(loggedIn);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoggedIn(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [storagePath]);

  function saveStoredPdf(url) {
    savePdfFile(url, issueFileName(storagePath));
  }

  async function openStoredPdf() {
    if (blobUrlRef.current) {
      saveStoredPdf(blobUrlRef.current);
      return;
    }

    if (loadingRef.current) {
      return;
    }

    let loggedIn = isLoggedIn;

    if (loggedIn === null) {
      try {
        loggedIn = await readLoggedIn();
        setIsLoggedIn(loggedIn);
      } catch {
        loggedIn = false;
        setIsLoggedIn(false);
      }
    }

    if (!loggedIn) {
      setAlertOpen(true);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setLoadError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(ISSUE_FILE_BUCKET)
        .download(storagePath);

      if (error || !data) {
        throw new Error(error?.message || "PDF를 열 수 없습니다.");
      }

      const filename = issueFileName(storagePath);
      const file = new File([data], filename, { type: ISSUE_FILE_MIME });
      const blobUrl = URL.createObjectURL(file);

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      blobUrlRef.current = blobUrl;
      savePdfFile(blobUrl, filename);
    } catch {
      setLoadError("PDF를 열 수 없습니다.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }

  function handleClick() {
    if (!storagePath) {
      openPdfTab(fileUrl);
      return;
    }

    if (isLoggedIn === false) {
      setAlertOpen(true);
      return;
    }

    void openStoredPdf();
  }

  if (!storagePath) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${className ?? ""}`}
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? "불러오는 중…" : children}
      </button>
      <AlertDialog
        open={alertOpen || Boolean(loadError)}
        title={SUBSCRIBER_ONLY_ALERT.title}
        message={loadError || SUBSCRIBER_ONLY_ALERT.message}
        confirmLabel={loadError ? "닫기" : SUBSCRIBER_ONLY_ALERT.confirmLabel}
        centerActions
        cancelLabel={loadError ? null : "닫기"}
        onConfirm={() => {
          if (loadError) {
            setLoadError("");
            return;
          }

          router.push("/subscription");
        }}
        onCancel={() => {
          setAlertOpen(false);
          setLoadError("");
        }}
      />
    </>
  );
}
