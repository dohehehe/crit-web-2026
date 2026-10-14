import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { truncatePlainText } from "@/lib/text/truncatePlainText";

export function getPostMetaDescription(post, maxLength = 160) {
  const explicit =
    typeof post?.description === "string"
      ? post.description.replace(/\r\n/g, "\n").trim()
      : "";

  if (explicit) {
    return explicit;
  }

  const fromContent = getEditorParagraphPlainText(post?.content);

  if (!fromContent) {
    return "";
  }

  return truncatePlainText(fromContent, maxLength);
}
