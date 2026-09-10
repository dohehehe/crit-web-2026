import { getCaptionPlainText } from "@/lib/editorjs/normalizeEditorHtml";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";

function isParagraphBlock(block) {
  return block?.type === "paragraph" || block?.type === "p";
}

export function getEditorParagraphPlainText(content) {
  return normalizeBlocks(content)
    .filter(isParagraphBlock)
    .map((block) => getCaptionPlainText(block.data?.text))
    .filter(Boolean)
    .join(" ");
}