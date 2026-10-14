import { getSiteOrigin } from "@/lib/auth/getSiteOrigin";
import {
  DEFAULT_SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
} from "@/lib/seo/constants";
import { toAbsolutePath, toAbsoluteUrl } from "@/lib/seo/toAbsoluteUrl";

function normalizeImages(image, origin) {
  const values = Array.isArray(image) ? image : [image];
  const images = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === "string") {
      const url = toAbsoluteUrl(value, origin);

      if (url) {
        images.push({ url });
      }

      continue;
    }

    if (typeof value === "object" && value.url) {
      const url = toAbsoluteUrl(value.url, origin);

      if (url) {
        images.push({
          url,
          ...(value.width ? { width: value.width } : {}),
          ...(value.height ? { height: value.height } : {}),
          ...(value.alt ? { alt: value.alt } : {}),
        });
      }
    }
  }

  return images;
}

export async function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  robots,
} = {}) {
  const origin = await getSiteOrigin();
  const canonical = toAbsolutePath(path, origin);
  const images = normalizeImages(image, origin);
  const resolvedDescription =
    typeof description === "string" && description.trim()
      ? description.trim()
      : undefined;
  const resolvedTitle = title || SITE_NAME;

  return {
    title: resolvedTitle,
    description: resolvedDescription ?? DEFAULT_SITE_DESCRIPTION,
    keywords:
      Array.isArray(keywords) && keywords.length > 0 ? keywords : undefined,
    authors: authors?.length ? authors.map((name) => ({ name })) : undefined,
    robots,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription ?? DEFAULT_SITE_DESCRIPTION,
      url: canonical ?? origin,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type,
      ...(images.length > 0 ? { images } : {}),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
      ...(type === "article" && authors?.length ? { authors } : {}),
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription ?? DEFAULT_SITE_DESCRIPTION,
      ...(images.length > 0 ? { images: images.map((item) => item.url) } : {}),
    },
  };
}

export function getMetadataBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  try {
    return new URL(envUrl || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}
