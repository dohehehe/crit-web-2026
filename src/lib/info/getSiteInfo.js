import "server-only";

import { cache } from "react";
import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { createAdminClient } from "@/lib/supabase/admin";

const INFO_SELECT = "email,insta,youtube,info_text";

function parseEditorContents(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return { body: trimmed };
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return null;
}

function parseInfoText(value) {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === "object") {
    if (typeof value.text === "string") {
      const trimmed = value.text.trim();
      return trimmed || null;
    }

    const fromEditor = getEditorParagraphPlainText(value);
    if (fromEditor) {
      return fromEditor;
    }
  }

  return null;
}

function normalizeExternalUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/\//, "")}`;
}

export function normalizeInstagramHref(value) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, "");
  return `https://www.instagram.com/${handle}/`;
}

export function normalizeYoutubeHref(value) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("@")) {
    return `https://www.youtube.com/${trimmed}`;
  }

  return normalizeExternalUrl(trimmed);
}

export const getSiteInfo = cache(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("info")
    .select(INFO_SELECT)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    email: data.email?.trim() || null,
    infoText: parseInfoText(data.info_text),
    instagramHref: normalizeInstagramHref(data.insta),
    youtubeHref: normalizeYoutubeHref(data.youtube),
  };
});

export const getSubscriptionText = cache(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("info")
    .select("subscription_text")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return parseEditorContents(data.subscription_text);
});
