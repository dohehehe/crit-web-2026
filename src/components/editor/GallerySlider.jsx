"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./EditorContent.module.css";

const SCROLL_RATIO = 0.9;

function updateScrollButtons(viewport) {
  if (!viewport) {
    return { canGoPrev: false, canGoNext: false };
  }

  const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

  return {
    canGoPrev: viewport.scrollLeft > 0,
    canGoNext: viewport.scrollLeft < maxScrollLeft - 1,
  };
}

export function GallerySlider({ slides, blockCaptionHtml }) {
  const viewportRef = useRef(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const syncScrollState = useCallback(() => {
    const nextState = updateScrollButtons(viewportRef.current);
    setCanGoPrev(nextState.canGoPrev);
    setCanGoNext(nextState.canGoNext);
  }, []);

  useEffect(() => {
    syncScrollState();

    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    viewport.addEventListener("scroll", syncScrollState, { passive: true });
    window.addEventListener("resize", syncScrollState);

    return () => {
      viewport.removeEventListener("scroll", syncScrollState);
      window.removeEventListener("resize", syncScrollState);
    };
  }, [slides, syncScrollState]);

  const scrollGallery = (direction) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollBy({
      left: direction * viewport.clientWidth * SCROLL_RATIO,
      behavior: "smooth",
    });
  };

  if (!slides.length) {
    return null;
  }

  return (
    <figure className={styles.galleryBlock}>
      <div className={styles.galleryViewportWrap}>
        <div ref={viewportRef} className={styles.galleryViewport}>
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

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.galleryNav} ${styles.galleryNavPrev}`}
              onClick={() => scrollGallery(-1)}
              disabled={!canGoPrev}
              aria-label="Previous images"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.galleryNav} ${styles.galleryNavNext}`}
              onClick={() => scrollGallery(1)}
              disabled={!canGoNext}
              aria-label="Next images"
            >
              ›
            </button>
          </>
        ) : null}
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
