import Link from "next/link";
import { EditorContent } from "@/components/editor/EditorContent";
import { getAuthorsByName } from "@/lib/authors/getAuthors";
import { getEditors } from "@/lib/editors/getEditors";
import { getEditorParagraphPlainText } from "@/lib/editorjs/getEditorParagraphPlainText";
import { getInfoText, getManifestoText } from "@/lib/info/getSiteInfo";
import { getAuthorPath } from "@/lib/routes/authors";
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

function editorHeading(editor) {
  return editor.name || editor.nameEn;
}

export default async function AboutPage() {
  const [infoText, manifestoText, editors, authors] = await Promise.all([
    getInfoText(),
    getManifestoText(),
    getEditors(),
    getAuthorsByName(),
  ]);
  const visibleEditors = editors.filter((editor) => editorHeading(editor));
  const hasIntro = Boolean(infoText || manifestoText);
  const hasAuthors = authors.length > 0;

  return (
    <main className={styles.main}>
      <article className={styles.article}>
        {infoText ? (
          <section
            className={`${styles.contents}${manifestoText ? ` ${styles.contentsBeforeManifesto}` : ""}`}
          >
            <EditorContent contents={infoText} />
          </section>
        ) : null}
      </article>

      <div className={styles.contentContainer}>
        <aside className={styles.aside}>
          <ul className={styles.asideList}>
            {manifestoText ? (
              <li className={styles.asideItem}>
                <a href="#about-manifesto" className={styles.asideLink}>
                  Crit.Manifesto
                </a>
              </li>
            ) : null}
            {visibleEditors.length > 0 ? (
              <li className={styles.asideItem}>
                <a href="#about-editors" className={styles.asideLink}>
                  Editors
                </a>
              </li>
            ) : null}
            {hasAuthors ? (
              <li className={styles.asideItem}>
                <a href="#about-authors" className={styles.asideLink}>
                  Contributors
                </a>
              </li>
            ) : null}
          </ul>
        </aside>

        <article className={styles.contentArticle}>
          {manifestoText ? (
            <section
              id="about-manifesto"
              className={`${styles.section} ${styles.manifesto}${visibleEditors.length === 0 && !hasAuthors ? ` ${styles.manifestoLast}` : ""}`}
              aria-labelledby="about-manifesto-heading"
            >
              <h2 id="about-manifesto-heading" className={`${styles.sectionTitle} ${styles.manifestoTitle}`}>
                Crit.Manifesto
              </h2>
              <EditorContent contents={manifestoText} />
            </section>
          ) : null}

          {visibleEditors.length > 0 ? (
            <section
              id="about-editors"
              className={`${styles.section} ${styles.editors}${hasIntro ? "" : ` ${styles.editorsFirst}`}`}
              aria-labelledby="about-editors-heading"
            >
              <h2 id="about-editors-heading" className={`${styles.sectionTitle} ${styles.editorsTitle}`}>
                Editors
              </h2>
              <ul className={styles.editorList}>
                {visibleEditors.map((editor) => (
                  <li key={editor.id} className={styles.editor}>
                    <h3 className={`p-bold ${styles.editorName}`}>{editorHeading(editor)}</h3>
                    {editor.name && editor.nameEn ? (
                      <p className={`p ${styles.editorNameEn}`}>{editor.nameEn}</p>
                    ) : null}
                    {editor.description ? (
                      <EditorContent contents={editor.description} />
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hasAuthors ? (
            <section
              id="about-authors"
              className={`${styles.section} ${styles.authors}${hasIntro || visibleEditors.length > 0 ? "" : ` ${styles.authorsFirst}`}`}
              aria-labelledby="about-authors-heading"
            >
              <h2 id="about-authors-heading" className={`${styles.sectionTitle} ${styles.authorsTitle}`}>
                Authors
              </h2>
              <ul className={styles.authorList}>
                {authors.map((author) => (
                  <li key={author.id}>
                    <Link href={getAuthorPath(author)} className={`tag-keyword ${styles.authorLink}`}>
                      {author.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </div>

      {!hasIntro && visibleEditors.length === 0 && !hasAuthors ? (
        <p className={`${styles.empty} caption gray-65`}>
          표시할 소개가 없습니다.
        </p>
      ) : null}

    </main>
  );
}
