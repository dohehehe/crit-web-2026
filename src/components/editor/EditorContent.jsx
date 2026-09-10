import Image from "next/image";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import styles from "./EditorContent.module.css";

function renderListItems(items, ordered) {
  if (!items?.length) {
    return null;
  }

  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag className={styles.list}>
      {items.map((item, index) => {
        const content = typeof item === "string" ? item : item.content;

        return (
          <li key={index}>
            {content ? (
              <span dangerouslySetInnerHTML={{ __html: content }} />
            ) : null}
            {item?.items?.length ? renderListItems(item.items, ordered) : null}
          </li>
        );
      })}
    </ListTag>
  );
}

function renderBlock(block, index) {
  const { type, data } = block;

  switch (type) {
    case "header": {
      const level = Math.min(Math.max(Number(data?.level) || 2, 2), 4);
      const Tag = `h${level}`;

      return (
        <Tag
          key={index}
          className={styles.header}
          dangerouslySetInnerHTML={{ __html: data?.text ?? "" }}
        />
      );
    }

    case "paragraph":
      return (
        <p
          key={index}
          className={`p ${styles.paragraph}`}
          dangerouslySetInnerHTML={{ __html: data?.text ?? "" }}
        />
      );

    case "list":
      return (
        <div key={index} className={styles.listBlock}>
          {renderListItems(data?.items, data?.style === "ordered")}
        </div>
      );

    case "quote":
      return (
        <blockquote key={index} className={styles.quote}>
          <p
            className="p"
            dangerouslySetInnerHTML={{ __html: data?.text ?? "" }}
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
            <figcaption className={`caption ${styles.imageCaption}`}>
              {data.caption}
            </figcaption>
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
        <div key={index} className={styles.embed}>
          <iframe
            src={embedUrl}
            title={data?.caption ?? "Embedded content"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
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

  return <div className={styles.content}>{blocks.map(renderBlock)}</div>;
}
