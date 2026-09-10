"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { createEditorImageUploader } from "@/lib/editorjs/createEditorImageUploader";
import { loadGalleryTool } from "@/lib/editorjs/galleryTool";
import {
  loadFootnotesTune,
  scheduleGlobalFootnoteRenumber,
} from "@/lib/editorjs/footnotesTune";
import { normalizeEditorData } from "@/lib/editorjs/normalizeBlocks";
import styles from "@/components/admin/shared/editor/Editor.module.css";

const INLINE_TOOLS = ["link", "bold", "italic", "underline", "marker"];

const Editor = forwardRef(function Editor({ data, holderId = "editorjs" }, ref) {
  const editorInstanceRef = useRef(null);
  const initialDataRef = useRef(data);
  const { uploadImageToServer } = useImageUpload();
  const uploadImageRef = useRef(uploadImageToServer);

  uploadImageRef.current = uploadImageToServer;

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (editorInstanceRef.current) {
        return editorInstanceRef.current.save();
      }

      throw new Error("Editor is not ready");
    },
    isReady: () => editorInstanceRef.current !== null,
  }));

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let editor = null;
    let cancelled = false;

    const initEditor = async () => {
      try {
        const holder = document.getElementById(holderId);

        if (!holder) {
          console.error("Editor holder not found:", holderId);
          return;
        }

        const [
          { default: EditorJS },
          { default: Embed },
          { default: Header },
          { default: ImageTool },
          { default: List },
          { default: Marker },
          { default: Quote },
          { default: Sortable },
          { default: Underline },
          FootnotesTune,
          GalleryTool,
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/embed"),
          import("@editorjs/header"),
          import("@editorjs/image"),
          import("@editorjs/list"),
          import("@editorjs/marker"),
          import("@editorjs/quote"),
          import("sortablejs"),
          import("@editorjs/underline"),
          loadFootnotesTune(),
          loadGalleryTool(),
        ]);

        if (cancelled) {
          return;
        }

        const imageUploader = createEditorImageUploader((file) =>
          uploadImageRef.current(file),
        );

        editor = new EditorJS({
          holder: holderId,
          placeholder: "내용을 입력하세요...",
          tunes: ["footnotes"],
          i18n: {
            messages: {
              toolNames: {
                Image: "단독 이미지",
                Gallery: "이미지 슬라이더",
              },
              tools: {
                gallery: {
                  "Select an Image": "슬라이더 이미지 추가",
                  "Gallery caption": "슬라이더 설명",
                  "Image caption": "이미지 설명",
                },
              },
            },
          },
          tools: {
            header: {
              class: Header,
              inlineToolbar: INLINE_TOOLS,
              config: {
                placeholder: "제목을 입력하세요",
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+O',
              config: {
                quotePlaceholder: '인용문을 입력하세요',
                captionPlaceholder: 'Quote\'s author',
              },
            },
            list: {
              class: List,
              inlineToolbar: INLINE_TOOLS,
              config: {
                defaultStyle: "ordered",
                maxLevel: 4,
              },
            },
            footnotes: {
              class: FootnotesTune,
              config: {
                placeholder: "각주 내용을 입력하세요",
                shortcut: "CMD+SHIFT+F",
              },
            },
            underline: Underline,
            marker: Marker,
            embed: {
              class: Embed,
              inlineToolbar: INLINE_TOOLS,
              config: {
                services: {
                  youtube: true,
                },
              },
            },
            image: {
              class: ImageTool,
              inlineToolbar: INLINE_TOOLS,
              config: {
                captionPlaceholder: "이미지 설명을 입력하세요",
                buttonContent: "단독 이미지 선택",
                features: {
                  border: false,
                  caption: true,
                  background: false,
                },
                uploader: imageUploader,
              },
            },
            gallery: {
              class: GalleryTool,
              config: {
                sortableJs: Sortable,
                buttonContent: "슬라이더 이미지 추가",
                uploader: imageUploader,
              },
            },
          },
          inlineToolbar: INLINE_TOOLS,
          data: normalizeEditorData(initialDataRef.current),
          onChange: (_api, event) => {
            const events = Array.isArray(event) ? event : [event];
            const shouldRenumber = events.some(({ type }) =>
              ["block-moved", "block-added", "block-removed"].includes(type),
            );

            if (shouldRenumber) {
              scheduleGlobalFootnoteRenumber();
            }
          },
        });

        await editor.isReady;

        if (cancelled) {
          await editor.destroy();
          return;
        }

        editorInstanceRef.current = editor;
      } catch (error) {
        console.error("Editor initialization failed:", error);
      }
    };

    const timer = setTimeout(initEditor, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);

      if (
        editorInstanceRef.current &&
        typeof editorInstanceRef.current.destroy === "function"
      ) {
        try {
          editorInstanceRef.current.destroy();
        } catch (error) {
          console.warn("Editor destroy failed:", error);
        }

        editorInstanceRef.current = null;
      }
    };
  }, [holderId]);

  return (
    <div className={styles.wrapper}>
      <div
        id={holderId}
        className={styles.holder}
        suppressHydrationWarning
      />
    </div>
  );
});

Editor.displayName = "Editor";

export default Editor;