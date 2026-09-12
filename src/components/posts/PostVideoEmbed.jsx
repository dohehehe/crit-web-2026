import { getYoutubeEmbedUrl } from "@/lib/youtube/getYoutubeEmbedUrl";
import styles from "./PostView.module.css";

export function PostVideoEmbed({ videoUrl, title }) {
  const embedUrl = getYoutubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <section className={styles.thumbnailSection}>
      <div className={styles.videoEmbed}>
        <iframe
          src={embedUrl}
          title={title ? `${title} video` : "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  );
}
