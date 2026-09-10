import Image from "next/image";
import { createFootnoteContext } from "@/lib/editorjs/footnotes";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import styles from "./EditorContent.module.css";

function DocumentFootnotes({ footnotes }) {
  if (!footnotes?.length) {
    return null;
  }

  return (
    <aside className={styles.footnotesSection}>
      {footnotes.map((note) => (
        <p key={note.footnoteId} id={note.footnoteId} className={styles.footnoteItem}>
          <sup className={styles.footnoteMarker}>{note.superscript}</sup>
          <span dangerouslySetInnerHTML={{ __html: note.content }} />
        </p>
      ))}
    </aside>
  );
}

function renderListItems(items, ordered, applyFootnotesToHtml) {
  if (!items?.length) {
    return null;
  }

  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag className={styles.list}>
      {items.map((item, index) => {
        const content = typeof item === "string" ? item : item.content;
        const processedContent = content ? applyFootnotesToHtml(content) : "";

        return (
          <li key={index}>
            {processedContent ? (
              <span dangerouslySetInnerHTML={{ __html: processedContent }} />
            ) : null}
            {item?.items?.length
              ? renderListItems(item.items, ordered, applyFootnotesToHtml)
              : null}
          </li>
        );
      })}
    </ListTag>
  );
}

function renderBlock(block, index, applyFootnotesToHtml) {
  const { type, data } = block;

  switch (type) {
    case "header": {
      const level = Math.min(Math.max(Number(data?.level) || 2, 2), 4);
      const Tag = `h${level}`;

      return (
        <Tag
          key={index}
          className={styles.header}
          dangerouslySetInnerHTML={{
            __html: applyFootnotesToHtml(data?.text ?? ""),
          }}
        />
      );
    }

    case "paragraph":
      return (
        <p
          key={index}
          className={`p ${styles.paragraph}`}
          dangerouslySetInnerHTML={{
            __html: applyFootnotesToHtml(data?.text ?? ""),
          }}
        />
      );

    case "list":
      return (
        <div key={index} className={styles.listBlock}>
          {renderListItems(
            data?.items,
            data?.style === "ordered",
            applyFootnotesToHtml,
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote key={index} className={styles.quote}>
          <p
            className="p"
            dangerouslySetInnerHTML={{
              __html: applyFootnotesToHtml(data?.text ?? ""),
            }}
          />
          {data?.caption ? (
            <cite className={`caption ${styles.quoteCaption}`}>{data.caption}</cite>
          ) : null}
        </blockquote>
      );

    case "image": {
      const imageUrl = (data?.file?.url ?? data?.url)?.trim();

      if (!imageUrl) {
        return null;
      }

      return (
        <figure key={index} className={styles.imageBlock}>
          <Image
            src={imageUrl}
            alt={data?.caption ?? ""}
            width={0}
            height={0}
            sizes="100vw"
            className={styles.image}
          />
          {data?.caption ? (
            <figcaption
              className={`caption ${styles.imageCaption}`}
              dangerouslySetInnerHTML={{
                __html: applyFootnotesToHtml(data.caption),
              }}
            />
          ) : null}
        </figure>
      );
    }

    case "embed": {
      const embedUrl = data?.embed ?? data?.source;

      if (!embedUrl) {
        return null;
      }

      return (
        <figure key={index} className={styles.embedBlock}>
          <div className={styles.embed}>
            <iframe
              src={embedUrl}
              title={data?.caption ?? "Embedded content"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {data?.caption ? (
            <figcaption
              className={`caption ${styles.embedCaption}`}
              dangerouslySetInnerHTML={{
                __html: applyFootnotesToHtml(data.caption),
              }}
            />
          ) : null}
        </figure>
      );
    }

    case "delimiter":
      return <hr key={index} className={styles.delimiter} />;

    default:
      return null;
  }
}

export function EditorContent({ contents }) {
  const blocks = normalizeBlocks(contents);

  if (blocks.length === 0) {
    return null;
  }

  const footnoteContext = createFootnoteContext(blocks);

  return (
    <div className={styles.content}>
      {blocks.map((block, index) =>
        renderBlock(block, index, footnoteContext.applyToHtml),
      )}
      <DocumentFootnotes footnotes={footnoteContext.entries} />
    </div>
  );
}
