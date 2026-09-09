"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { normalizeEditorData } from "@/lib/editorjs/normalizeBlocks";
import styles from "@/components/admin/shared/editor/Editor.module.css";

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
          { default: Quote },
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/embed"),
          import("@editorjs/header"),
          import("@editorjs/image"),
          import("@editorjs/list"),
          import("@editorjs/quote"),
        ]);

        if (cancelled) {
          return;
        }

        editor = new EditorJS({
          holder: holderId,
          placeholder: "내용을 입력하세요...",
          tools: {
            header: {
              class: Header,
              inlineToolbar: ["link", "bold", "italic"],
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
              inlineToolbar: ["link", "bold", "italic"],
              config: {
                defaultStyle: "ordered",
                maxLevel: 4,
              },
            },
            embed: {
              class: Embed,
              inlineToolbar: ["link", "bold", "italic"],
              config: {
                services: {
                  youtube: true,
                },
              },
            },
            image: {
              class: ImageTool,
              inlineToolbar: ["link", "bold", "italic"],
              config: {
                captionPlaceholder: "이미지 설명을 입력하세요",
                buttonContent: "이미지 선택",
                features: {
                  border: false,
                  caption: true,
                  background: false,
                },
                uploader: {
                  uploadByFile: async (file) => {
                    try {
                      const result = await uploadImageRef.current(file);

                      if (result?.success && result?.file?.url) {
                        return {
                          success: 1,
                          file: {
                            url: result.file.url,
                            width: result.file.width,
                            height: result.file.height,
                          },
                        };
                      }

                      return {
                        success: 0,
                        error: result?.error || "업로드 실패",
                      };
                    } catch (error) {
                      console.error("Editor 이미지 업로드 에러:", error);
                      return { success: 0, error: error.message };
                    }
                  },
                },
              },
            },
          },
          inlineToolbar: ["link", "bold", "italic"],
          data: normalizeEditorData(initialDataRef.current),
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