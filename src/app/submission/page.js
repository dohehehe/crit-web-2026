import { EditorContent } from "@/components/editor/EditorContent";
import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getSubmissionText } from "@/lib/info/getSiteInfo";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { truncatePlainText } from "@/lib/text/truncatePlainText";
import styles from "./page.module.css";

export const revalidate = 60;

export async function generateMetadata() {
  const submissionText = await getSubmissionText();
  const description = truncatePlainText(
    getEditorParagraphPlainText(submissionText)
  );

  return buildPageMetadata({
    title: "투고",
    description,
    path: "/submission",
  });
}

export default async function SubmissionPage() {
  const submissionText = await getSubmissionText();

  return (
    <main className={styles.main}>
      <article className={styles.article}>
        {submissionText ? (
          <section className={styles.contents}>
            <EditorContent contents={submissionText} />
          </section>
        ) : (
          <p className={`${styles.empty} caption gray-65`}>
            표시할 내용이 없습니다.
          </p>
        )}
      </article>
    </main>
  );
}
