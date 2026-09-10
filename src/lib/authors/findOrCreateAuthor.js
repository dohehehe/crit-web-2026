import { api } from "@/lib/api/fetcher";
import { slugifyKeyword } from "@/lib/keywords/slugify";

export async function findOrCreateAuthor(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const existing = await api.get("authors", {
    "eq.name": trimmed,
    select: "id",
    limit: 1,
    scope: "admin",
  });

  if (existing.items?.length > 0) {
    return existing.items[0].id;
  }

  const created = await api.post("authors", {
    name: trimmed,
    slug: slugifyKeyword(trimmed) || trimmed,
  });

  return created.id;
}
