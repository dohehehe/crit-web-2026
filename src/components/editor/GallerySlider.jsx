import Image from "next/image";
import styles from "@/components/editor/EditorContent.module.css";

export function GallerySlider({ slides, blockCaptionHtml }) {
  if (!slides.length) {
    return null;
  }

  return (
    <figure className={styles.galleryBlock}>
      <div className={styles.galleryViewportWrap}>
        <div className={styles.galleryViewport}>
          <div className={styles.galleryTrack}>
            {slides.map((slide, index) => {
              const itemCaptionHtml = slide.captionHtml?.trim() ?? "";

              return (
                <figure
                  key={`${slide.url}-${index}`}
                  className={styles.galleryItem}
                >
                  <Image
                    src={slide.url}
                    alt={itemCaptionHtml ? "" : `Gallery image ${index + 1}`}
                    width={1600}
                    height={500}
                    sizes="100vw"
                    className={styles.galleryImage}
                  />
                  {itemCaptionHtml ? (
                    <figcaption
                      className={`caption ${styles.galleryItemCaption}`}
                      dangerouslySetInnerHTML={{ __html: itemCaptionHtml }}
                    />
                  ) : null}
                </figure>
              );
            })}
          </div>
        </div>
      </div>

      {blockCaptionHtml ? (
        <figcaption
          className={`caption ${styles.galleryCaption}`}
          dangerouslySetInnerHTML={{ __html: blockCaptionHtml }}
        />
      ) : null}
    </figure>
  );
}
