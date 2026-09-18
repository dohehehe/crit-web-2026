import { isAuthorsTabSelected } from "@/lib/admin/authors-tab";
import { isKeywordsTabSelected } from "@/lib/admin/keywords-tab";

export function isContentsUtilityTabSelected(selectedId) {
  return isKeywordsTabSelected(selectedId) || isAuthorsTabSelected(selectedId);
}
