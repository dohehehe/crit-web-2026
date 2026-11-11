"use client";

import { useCallback } from "react";
import { prepareImageForUpload } from "@/lib/imageUpload/processImage";
import { createClient } from "@/lib/supabase/browser";

async function readPayload(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function useImageUpload() {
  const uploadImageToServer = useCallback(async (file) => {
    try {
      const prepared = await prepareImageForUpload(file);
      const signResponse = await fetch("/api/upload/image/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      const signPayload = await readPayload(signResponse);

      if (!signResponse.ok || !signPayload?.ok) {
        return {
          success: false,
          error: signPayload?.error ?? "업로드 실패",
        };
      }

      const { path, token, bucket } = signPayload.data;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, prepared.file, {
          contentType: file.type,
        });

      if (uploadError) {
        return {
          success: false,
          error: uploadError.message ?? "업로드 실패",
        };
      }

      const response = await fetch("/api/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          width: prepared.width,
          height: prepared.height,
        }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.ok) {
        return {
          success: false,
          error: payload?.error ?? "업로드 실패",
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
