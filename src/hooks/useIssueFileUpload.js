"use client";

import { useCallback } from "react";
import {
  ISSUE_FILE_MAX_BYTES,
  ISSUE_FILE_MIME,
} from "@/lib/issueUpload/constants";

function isPdfFile(file) {
  return (
    file.type === ISSUE_FILE_MIME || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function useIssueFileUpload() {
  const uploadIssueFileToServer = useCallback(async (file) => {
    if (!isPdfFile(file)) {
      return {
        success: false,
        error: "PDF 파일만 업로드할 수 있습니다.",
      };
    }

    if (file.size > ISSUE_FILE_MAX_BYTES) {
      return {
        success: false,
        error: "PDF 파일은 50MB를 넘을 수 없습니다.",
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/issue", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        return {
          success: false,
          error: payload.error ?? "업로드 실패",
        };
      }

      return {
        success: true,
        file: payload.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message ?? "업로드 실패",
      };
    }
  }, []);

  return { uploadIssueFileToServer };
}
