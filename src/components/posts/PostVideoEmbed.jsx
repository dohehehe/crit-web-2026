"use client";

import { useState } from "react";
import {
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl,
  getYoutubeVideoId,
} from "@/lib/youtube/getYoutubeEmbedUrl";
import styles from "./PostView.module.css";

export function PostVideoEmbed({ videoUrl, title }) {
  const videoId = getYoutubeVideoId(videoUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailQuality, setThumbnailQuality] = useState("sd");

  if (!videoId) {
    return null;
  }

  const embedUrl = getYoutubeEmbedUrl(videoUrl, { autoplay: true });
  const thumbnailUrl = getYoutubeThumbnailUrl(videoId, thumbnailQuality);
  const playLabel = title ? `${title} 재생` : "YouTube video 재생";

  return (
    <section className={styles.thumbnailSection}>
      <div className={styles.videoEmbed}>
        {isPlaying && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title ? `${title} video` : "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.videoFacade}
            onClick={() => setIsPlaying(true)}
            aria-label={playLabel}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                className={styles.videoFacadeImage}
                onError={() => {
                  setThumbnailQuality((current) => {
                    if (current === "sd") return "hq";
                    if (current === "hq") return "mq";
                    return current;
                  });
                }}
              />
            ) : null}
            <span className={styles.videoFacadeOverlay} aria-hidden="true" />
            <span className={styles.videoPlayIcon} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
