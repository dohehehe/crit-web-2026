import { EditorContent } from "@/components/editor/EditorContent";
import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getSubscriptionText } from "@/lib/info/getSiteInfo";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { truncatePlainText } from "@/lib/text/truncatePlainText";
import styles from "./page.module.css";

export const revalidate = 60;

export async function generateMetadata() {
  const subscriptionText = await getSubscriptionText();
  const description = truncatePlainText(
    getEditorParagraphPlainText(subscriptionText)
  );

  return buildPageMetadata({
    title: "투고",
    description,
    path: "/submission",
  });
}

export default async function SubmissionPage() {
  const subscriptionText = await getSubscriptionText();

  return (
    <main className={styles.main}>
      <article className={styles.article}>
        {subscriptionText ? (
          <section className={styles.contents}>
            <EditorContent contents={subscriptionText} />
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
