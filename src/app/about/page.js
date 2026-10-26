import { EditorContent } from "@/components/editor/EditorContent";
import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getInfoText } from "@/lib/info/getSiteInfo";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { truncatePlainText } from "@/lib/text/truncatePlainText";
import styles from "./page.module.css";

export const revalidate = 60;

export async function generateMetadata() {
  const infoText = await getInfoText();
  const description = truncatePlainText(getEditorParagraphPlainText(infoText));

  return buildPageMetadata({
    title: "크릿 소개",
    description,
    path: "/about",
  });
}

export default async function AboutPage() {
  const infoText = await getInfoText();

  return (
    <main className={styles.main}>
      <article className={styles.article}>
        {infoText ? (
          <section className={styles.contents}>
            <EditorContent contents={infoText} />
          </section>
        ) : (
          <p className={`${styles.empty} caption gray-65`}>
            표시할 소개가 없습니다.
          </p>
        )}
      </article>
    </main>
  );
}
