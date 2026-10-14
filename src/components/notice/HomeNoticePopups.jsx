import { EditorContent } from "@/components/editor/EditorContent";
import { NoticePopupFrame } from "@/components/notice/NoticePopupFrame";
import styles from "@/components/notice/NoticePopup.module.css";

export function HomeNoticePopups({ popups }) {
  if (!popups?.length) {
    return null;
  }

  return (
    <div className={styles.layer} aria-live="polite">
      {popups.map((popup, index) => (
        <NoticePopupFrame
          key={popup.id}
          id={popup.id}
          index={index}
          thumbnailImg={popup.thumbnailImg}
          linkUrl={popup.linkUrl}
        >
          {!popup.thumbnailImg && popup.hasContent ? (
            <EditorContent contents={popup.content} compact />
          ) : null}
        </NoticePopupFrame>
      ))}
    </div>
  );
}
