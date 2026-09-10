import { IMAGE_UPLOAD_BUCKET } from "./constants";

function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ""
  ).replace(/\/$/, "");
}

export function parseImageStoragePathFromUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  const supabaseUrl = getSupabaseUrl();

  if (!supabaseUrl) {
    return null;
  }

  const prefix = `${supabaseUrl}/storage/v1/object/public/${IMAGE_UPLOAD_BUCKET}/`;

  if (!url.startsWith(prefix)) {
    return null;
  }

  const path = decodeURIComponent(url.slice(prefix.length));

  if (!path.startsWith("images/")) {
    return null;
  }

  return path;
}