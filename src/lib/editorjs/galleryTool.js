const ITEM_CAPTION_SELECTOR = "[data-gallery-item-caption]";
const TRASH_BUTTON_SELECTOR = ".image-gallery__image-trash";

function enableCaptionInlineToolbar(captionNode) {
  captionNode.dataset.inlineToolbar = "true";
}

function bindGalleryItemDelete(tool, imageContainer) {
  if (tool.readOnly || !imageContainer) {
    return;
  }

  const trashButton = imageContainer.querySelector(TRASH_BUTTON_SELECTOR);

  if (!trashButton || trashButton.dataset.galleryDeleteBound === "true") {
    return;
  }

  trashButton.dataset.galleryDeleteBound = "true";

  trashButton.addEventListener(
    "click",
    (event) => {
      const item = imageContainer.closest("[data-gallery-item]");
      const itemsContainer = tool.ui?.nodes?.itemsContainer;

      if (!item || !itemsContainer || item.parentElement !== itemsContainer) {
        return;
      }

      const index = Array.prototype.indexOf.call(itemsContainer.children, item);

      if (index === -1) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      tool.api.tooltip.hide();
      item.remove();
      tool.deleteImage(index);
      tool.editorBlock?.dispatchChange?.();
    },
    true,
  );
}

function createItemCaptionElement(api, readOnly, caption = "") {
  const captionNode = document.createElement("div");

  captionNode.className = "image-gallery__item-caption";
  captionNode.dataset.galleryItemCaption = "true";
  captionNode.contentEditable = readOnly ? "false" : "true";
  captionNode.dataset.placeholder = api.i18n.t("Image caption");
  captionNode.innerHTML = caption;

  if (!readOnly) {
    enableCaptionInlineToolbar(captionNode);
  }

  return captionNode;
}

function wrapImageContainerWithCaption(tool, imageContainer, caption = "") {
  const { itemsContainer } = tool.ui.nodes;

  if (!imageContainer) {
    return;
  }

  if (imageContainer.dataset.galleryItem) {
    bindGalleryItemDelete(
      tool,
      imageContainer.querySelector(".image-gallery__image"),
    );
    return;
  }

  const itemWrapper = document.createElement("div");

  itemWrapper.className = "image-gallery__item";
  itemWrapper.dataset.galleryItem = "true";
  itemsContainer.replaceChild(itemWrapper, imageContainer);
  itemWrapper.appendChild(imageContainer);
  itemWrapper.appendChild(
    createItemCaptionElement(tool.api, tool.readOnly, caption),
  );
  bindGalleryItemDelete(tool, imageContainer);
}

function wrapImageWithCaption(tool, file) {
  const { itemsContainer } = tool.ui.nodes;
  const imageContainer = itemsContainer.lastElementChild;

  wrapImageContainerWithCaption(tool, imageContainer, file?.caption ?? "");
}

export async function loadGalleryTool() {
  const galleryModule = await import("@kiberpro/editorjs-gallery");
  const BaseGalleryTool = galleryModule.default ?? galleryModule;

  if (typeof BaseGalleryTool !== "function") {
    throw new Error("Gallery tool failed to load.");
  }

  class GalleryTool extends BaseGalleryTool {
    constructor(options) {
      super(options);
      this.editorBlock = options.block;
      this.patchItemCaptions();
      this.wrapExistingItemCaptions();
      this.patchBlockCaptionInlineToolbar();
    }

    patchBlockCaptionInlineToolbar() {
      if (this.readOnly || !this.ui?.nodes?.caption) {
        return;
      }

      enableCaptionInlineToolbar(this.ui.nodes.caption);
    }

    wrapExistingItemCaptions() {
      const { itemsContainer } = this.ui.nodes;
      const files = this._data?.files ?? [];
      const children = Array.from(itemsContainer.children);

      children.forEach((child, index) => {
        if (child.dataset.galleryItem) {
          const captionNode = child.querySelector(ITEM_CAPTION_SELECTOR);

          if (captionNode && !this.readOnly) {
            enableCaptionInlineToolbar(captionNode);
          }

          bindGalleryItemDelete(
            this,
            child.querySelector(".image-gallery__image"),
          );
          return;
        }

        wrapImageContainerWithCaption(
          this,
          child,
          files[index]?.caption ?? "",
        );
      });
    }

    patchItemCaptions() {
      const originalAppendImage = this.ui.appendImage.bind(this.ui);

      this.ui.appendImage = (file) => {
        originalAppendImage(file);
        wrapImageWithCaption(this, file);
      };
    }

    save() {
      const data = super.save();
      const items = Array.from(this.ui.nodes.itemsContainer.children);

      data.files = data.files.map((file, index) => {
        const captionNode = items[index]?.querySelector(ITEM_CAPTION_SELECTOR);

        return {
          ...file,
          caption: captionNode?.innerHTML?.trim() ?? "",
        };
      });

      return data;
    }
  }

  return GalleryTool;
}
