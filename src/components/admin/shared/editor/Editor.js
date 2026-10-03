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
import { attachImageOrientation } from "@/lib/editorjs/imageOrientation";
import { attachRichTextPaste } from "@/lib/editorjs/normalizePastedHtml";
import styles from "@/components/admin/shared/editor/Editor.module.css";
import proseStyles from "@/components/editor/editorProse.module.css";

const INLINE_TOOLS = ["link", "bold", "italic", "underline", "marker", "color"];

const TEXT_COLORS = ["#000000", "#FF6400", "#A6A6A6", "#FFFFFF"];

function toColorInputValue(color) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color;
  }

  const match = String(color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

  if (!match) {
    return "#FF6400";
  }

  return `#${match
    .slice(1, 4)
    .map((channel) => Number(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function usableRange(range) {
  if (!range || range.collapsed) {
    return null;
  }

  if (!range.startContainer.isConnected || !range.endContainer.isConnected) {
    return null;
  }

  return range;
}

function createColorTool(Tool) {
  return class extends Tool {
    render() {
      const button = super.render();
      this.savedRange = null;

      button.addEventListener("mousedown", (event) => {
        const selection = window.getSelection();

        if (selection?.rangeCount && !selection.isCollapsed) {
          this.savedRange = selection.getRangeAt(0).cloneRange();
        }

        if (event.target instanceof HTMLInputElement) {
          return;
        }

        event.preventDefault();
      });

      button.querySelector("#color-left-btn")?.addEventListener("click", () => {
        this.closePanel();
      });

      return button;
    }

    closePanel() {
      this.panel?.classList.remove("isOpen");
    }

    applyColor(color) {
      this.clickedOnLeft = false;
      this.color = color;

      if (this.dot) {
        this.dot.style.backgroundColor = color;
      }

      const nextInputValue = toColorInputValue(color);

      if (this.colorInput && /^#[0-9a-f]{6}$/i.test(nextInputValue)) {
        this.colorInput.value = nextInputValue;
      }

      this.closePanel();

      const selection = window.getSelection();
      const range =
        usableRange(selection?.rangeCount ? selection.getRangeAt(0) : null) ??
        usableRange(this.savedRange);

      if (range) {
        this.surround(range);
      }
    }

    createRightButton() {
      if (this.picker) {
        return this.picker;
      }

      const picker = document.createElement("div");
      const dot = document.createElement("span");
      const panel = document.createElement("div");
      const colors = this.config.colorCollections || [];

      picker.className = "critColorPicker";
      dot.className = "critColorPickerDot";
      dot.title = "색상 팔레트";
      dot.style.backgroundColor = this.color;
      panel.className = "critColorPickerPanel";
      this.dot = dot;
      this.panel = panel;

      const keepInPicker = (event) => {
        event.stopPropagation();
      };

      picker.addEventListener("click", keepInPicker);
      panel.addEventListener("click", keepInPicker);

      dot.addEventListener("click", (event) => {
        event.stopPropagation();
        panel.classList.toggle("isOpen");
      });

      for (const color of colors) {
        const swatch = document.createElement("span");
        swatch.className = "critColorSwatch";
        swatch.title = color;
        swatch.style.backgroundColor = color;
        swatch.addEventListener("click", (event) => {
          event.stopPropagation();
          this.applyColor(color);
        });
        panel.append(swatch);
      }

      if (this.config.customPicker) {
        const input = document.createElement("input");
        input.type = "color";
        input.className = "critColorInput";
        input.value = toColorInputValue(this.color);
        input.title = "직접 선택";
        this.colorInput = input;
        input.addEventListener("click", keepInPicker);
        input.addEventListener("input", () => {
          this.color = input.value;
          dot.style.backgroundColor = input.value;
        });
        input.addEventListener("change", (event) => {
          event.stopPropagation();
          this.applyColor(input.value);
        });
        panel.append(input);
      }

      this.onDocumentPointerDown = (event) => {
        if (!panel.classList.contains("isOpen")) {
          return;
        }

        const path = event.composedPath?.() ?? [];

        if (path.includes(picker)) {
          return;
        }

        this.closePanel();
      };

      document.addEventListener("mousedown", this.onDocumentPointerDown);
      picker.append(dot, panel);
      this.picker = picker;
      return picker;
    }

    clear() {
      if (this.onDocumentPointerDown) {
        document.removeEventListener("mousedown", this.onDocumentPointerDown);
        this.onDocumentPointerDown = null;
      }

      this.panel = null;
      this.dot = null;
      this.colorInput = null;
      super.clear();
    }

    surround(range) {
      if (!range) {
        return;
      }

      if (!this.api.selection.findParentTag(this.parentTag)) {
        const root =
          range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? range.commonAncestorContainer
            : range.commonAncestorContainer.parentElement;
        const inner = root?.querySelector(this.parentTag.toLowerCase());

        if (inner && range.intersectsNode(inner)) {
          this.api.selection.expandToTag(inner);
          super.surround(window.getSelection().getRangeAt(0));
          return;
        }
      }

      super.surround(range);
    }
  };
}

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
    let removePasteNormalizer = () => {};
    let removeImageOrientation = () => {};

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
          colorModule,
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
          import("editorjs-text-color-plugin"),
          loadFootnotesTune(),
          loadGalleryTool(),
        ]);

        if (cancelled) {
          return;
        }

        const imageUploader = createEditorImageUploader((file) =>
          uploadImageRef.current(file),
        );
        const ColorPlugin = colorModule.default ?? colorModule;
        const ColorTool = createColorTool(ColorPlugin);

        editor = new EditorJS({
          holder: holderId,
          placeholder: "내용을 입력하세요...",
          tunes: ["footnotes"],
          i18n: {
            messages: {
              toolNames: {
                Image: "단독 이미지",
                Gallery: "이미지 슬라이더",
                Color: "글자색",
              },
              tools: {
                image: {
                  "Stretch image": "가로로 채우기",
                },
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
            color: {
              class: ColorTool,
              config: {
                colorCollections: TEXT_COLORS,
                defaultColor: "#FF6400",
                type: "text",
                customPicker: true,
              },
            },
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
                  stretch: true,
                },
                uploader: imageUploader,
              },
            },
            gallery: {
              class: GalleryTool,
              inlineToolbar: INLINE_TOOLS,
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
        removePasteNormalizer = attachRichTextPaste(holder);
        removeImageOrientation = attachImageOrientation(holder);
      } catch (error) {
        console.error("Editor initialization failed:", error);
      }
    };

    const timer = setTimeout(initEditor, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      removePasteNormalizer();
      removeImageOrientation();

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
    <div className={`${styles.wrapper} ${proseStyles.root}`}>
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