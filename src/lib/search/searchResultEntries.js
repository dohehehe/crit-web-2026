import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getAuthorPath } from "@/lib/routes/authors";
import { truncatePlainText } from "@/lib/text/truncatePlainText";

export function authorToSearchEntry(author) {
  return {
    key: `author:${author.id}`,
    href: getAuthorPath(author),
    title: author.name ?? "",
    thumbnailImg: author.imgUrl ?? "",
    excerpt: truncatePlainText(getEditorParagraphPlainText(author.content)),
  };
}
