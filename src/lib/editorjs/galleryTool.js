const ITEM_CAPTION_SELECTOR = "[data-gallery-item-caption]";

function createItemCaptionElement(api, readOnly, caption = "") {
  const captionNode = document.createElement("div");

  captionNode.className = "image-gallery__item-caption";
  captionNode.dataset.galleryItemCaption = "true";
  captionNode.contentEditable = readOnly ? "false" : "true";
  captionNode.dataset.placeholder = api.i18n.t("Image caption");
  captionNode.innerHTML = caption;

  return captionNode;
}

function wrapImageWithCaption(ui, api, readOnly, file) {
  const { itemsContainer } = ui.nodes;
  const imageContainer = itemsContainer.lastElementChild;

  if (!imageContainer || imageContainer.dataset.galleryItem) {
    return;
  }

  const itemWrapper = document.createElement("div");

  itemWrapper.className = "image-gallery__item";
  itemWrapper.dataset.galleryItem = "true";
  itemsContainer.replaceChild(itemWrapper, imageContainer);
  itemWrapper.appendChild(imageContainer);
  itemWrapper.appendChild(
    createItemCaptionElement(api, readOnly, file?.caption ?? ""),
  );
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
      this.patchItemCaptions();
    }

    patchItemCaptions() {
      const originalAppendImage = this.ui.appendImage.bind(this.ui);

      this.ui.appendImage = (file) => {
        originalAppendImage(file);
        wrapImageWithCaption(this.ui, this.api, this.readOnly, file);
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
