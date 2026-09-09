"use client";

import { useCallback } from "react";
import { prepareImageForUpload } from "@/lib/imageUpload/processImage";

export function useImageUpload() {
  const uploadImageToServer = useCallback(async (file, options) => {
    try {
      const prepared = await prepareImageForUpload(file, options);
      const formData = new FormData();

      formData.append("file", prepared.file, prepared.fileName);
      formData.append("width", String(prepared.width));
      formData.append("height", String(prepared.height));

      const response = await fetch("/api/upload/image", {
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

  return { uploadImageToServer };
}
