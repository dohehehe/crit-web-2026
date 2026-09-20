import Image from "next/image";
import { GallerySlider } from "@/components/editor/GallerySlider";
import { createFootnoteContext } from "@/lib/editorjs/footnotes";
import { getGallerySlides } from "@/lib/editorjs/gallery";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import styles from "@/components/editor/EditorContent.module.css";
import proseStyles from "@/components/editor/editorProse.module.css";

function DocumentFootnotes({ footnotes }) {
  if (!footnotes?.length) {
    return null;
  }

  return (
    <aside className={`${proseStyles.footnotesSection} caption black`}>
      {footnotes.map((note) => (
        <p key={note.footnoteId} id={note.footnoteId} className={proseStyles.footnoteItem}>
          <sup className={proseStyles.footnoteMarker}>{note.superscript}</sup>
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
    <ListTag className={proseStyles.list}>
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
          className={proseStyles.header}
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
          className={`p ${proseStyles.paragraph}`}
          dangerouslySetInnerHTML={{
            __html: applyFootnotesToHtml(data?.text ?? ""),
          }}
        />
      );

    case "list":
      return (
        <div key={index} className={proseStyles.listBlock}>
          {renderListItems(
            data?.items,
            data?.style === "ordered",
            applyFootnotesToHtml,
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote key={index} className={proseStyles.quote}>
          <p
            className="p"
            dangerouslySetInnerHTML={{
              __html: applyFootnotesToHtml(data?.text ?? ""),
            }}
          />
          {data?.caption ? (
            <cite className={`p ${proseStyles.quoteCaption}`}>— {data.caption}</cite>
          ) : null}
        </blockquote>
      );

    case "image": {
      const imageUrl = (data?.file?.url ?? data?.url)?.trim();

      if (!imageUrl) {
        return null;
      }

      return (
        <figure key={index} className={proseStyles.imageBlock}>
          <Image
            src={imageUrl}
            alt={data?.caption ?? ""}
            width={0}
            height={0}
            sizes="100vw"
            className={proseStyles.image}
          />
          {data?.caption ? (
            <figcaption
              className={`caption ${proseStyles.imageCaption}`}
              dangerouslySetInnerHTML={{
                __html: applyFootnotesToHtml(data.caption),
              }}
            />
          ) : null}
        </figure>
      );
    }

    case "gallery": {
      const slides = getGallerySlides(data).map((slide) => ({
        url: slide.url,
        captionHtml: slide.caption
          ? applyFootnotesToHtml(slide.caption)
          : "",
      }));

      if (slides.length === 0) {
        return null;
      }

      const blockCaptionHtml = data?.caption
        ? applyFootnotesToHtml(data.caption)
        : "";

      return (
        <GallerySlider
          key={index}
          slides={slides}
          blockCaptionHtml={blockCaptionHtml}
        />
      );
    }

    case "embed": {
      const embedUrl = data?.embed ?? data?.source;

      if (!embedUrl) {
        return null;
      }

      return (
        <figure key={index} className={proseStyles.embedBlock}>
          <div className={proseStyles.embed}>
            <iframe
              src={embedUrl}
              title={data?.caption ?? "Embedded content"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {data?.caption ? (
            <figcaption
              className={`caption ${proseStyles.embedCaption}`}
              dangerouslySetInnerHTML={{
                __html: applyFootnotesToHtml(data.caption),
              }}
            />
          ) : null}
        </figure>
      );
    }

    case "delimiter":
      return <hr key={index} className={proseStyles.delimiter} />;

    default:
      return null;
  }
}

export function EditorContent({ contents, compact = false }) {
  const blocks = normalizeBlocks(contents);

  if (blocks.length === 0) {
    return null;
  }

  const footnoteContext = createFootnoteContext(blocks);
  const rootClassName = compact
    ? `${proseStyles.root} ${proseStyles.rootCompact}`
    : proseStyles.root;

  return (
    <div className={rootClassName}>
      {blocks.map((block, index) =>
        renderBlock(block, index, footnoteContext.applyToHtml),
      )}
      <DocumentFootnotes footnotes={footnoteContext.entries} />
    </div>
  );
}
