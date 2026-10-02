"use client";

import Image from "next/image";
import { useState } from "react";
import { isPortraitSize } from "@/lib/editorjs/imageOrientation";
import proseStyles from "@/components/editor/editorProse.module.css";

export function EditorImage({
  src,
  alt,
  captionHtml,
  stretched = false,
  width,
  height,
}) {
  const [measuredPortrait, setMeasuredPortrait] = useState(() =>
    isPortraitSize(width, height),
  );
  const portrait = !stretched && measuredPortrait;
  const figureClassName = [
    proseStyles.imageBlock,
    portrait ? proseStyles.imagePortrait : "",
    stretched ? proseStyles.imageStretched : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={figureClassName}>
      <Image
        src={src}
        alt={alt}
        width={Number(width) || 0}
        height={Number(height) || 0}
        sizes={portrait ? "50vw" : "100vw"}
        className={proseStyles.image}
        onLoad={(event) => {
          if (isPortraitSize(width, height)) {
            return;
          }

          const image = event.currentTarget;
          setMeasuredPortrait(image.naturalHeight > image.naturalWidth);
        }}
      />
      {captionHtml ? (
        <figcaption
          className={`caption ${proseStyles.imageCaption}`}
          dangerouslySetInnerHTML={{ __html: captionHtml }}
        />
      ) : null}
    </figure>
  );
}
