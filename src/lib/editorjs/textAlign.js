const TEXT_ALIGNMENTS = ["left", "center", "right", "justify"];

const ALIGN_LABELS = {
  left: "왼쪽 정렬",
  center: "가운데 정렬",
  right: "오른쪽 정렬",
  justify: "양쪽 정렬",
};

const ALIGN_ICONS = {
  left: alignIcon("M4 6h16M4 12h10M4 18h14"),
  center: alignIcon("M4 6h16M7 12h10M4 18h16"),
  right: alignIcon("M4 6h16M10 12h10M6 18h14"),
  justify: alignIcon("M4 6h16M4 12h16M4 18h16"),
};

function alignIcon(paths) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="${paths}"/></svg>`;
}

export function normalizeAlignment(value) {
  return TEXT_ALIGNMENTS.includes(value) ? value : "left";
}

export function blockAlignProps(alignment) {
  const value = normalizeAlignment(alignment);

  if (value === "left") {
    return {};
  }

  return {
    "data-text-align": value,
    style: { textAlign: value },
  };
}

export function applyBlockAlignment(element, alignment) {
  if (!element) {
    return;
  }

  const value = normalizeAlignment(alignment);
  element.dataset.textAlignRoot = "true";
  element.dataset.textAlign = value;
  element.style.textAlign = value === "left" ? "" : value;
}

export function readBlockAlignment(element) {
  return normalizeAlignment(element?.dataset?.textAlign);
}

function nextAlignment(alignment) {
  const index = TEXT_ALIGNMENTS.indexOf(normalizeAlignment(alignment));
  return TEXT_ALIGNMENTS[(index + 1) % TEXT_ALIGNMENTS.length];
}

export function withBlockAlignment(Tool, { wrap = false, syncData = false } = {}) {
  class AlignedTool extends Tool {
    constructor(args) {
      const alignment = normalizeAlignment(args?.data?.alignment);
      super(args);
      this._blockAlignment = alignment;
      this._syncAlignmentData = syncData;

      if (syncData && this.data && typeof this.data === "object") {
        this.data.alignment = alignment;
      }
    }

    render() {
      const rendered = super.render();
      let target = rendered;

      if (wrap && rendered) {
        const wrapper = document.createElement("div");
        wrapper.className = "critAlignBlock";
        wrapper.append(rendered);
        target = wrapper;
      }

      this._alignElement = target;
      applyBlockAlignment(target, this._blockAlignment);
      return target;
    }

    async save(element) {
      const saved = await super.save(element);

      if (!saved || typeof saved !== "object") {
        return saved;
      }

      const output = { ...saved };
      const source = element?.dataset?.textAlignRoot ? element : this._alignElement;
      const alignment = readBlockAlignment(source);

      if (alignment === "left") {
        delete output.alignment;
      } else {
        output.alignment = alignment;
      }

      return output;
    }

    setAlignment(alignment) {
      this._blockAlignment = normalizeAlignment(alignment);
      applyBlockAlignment(this._alignElement, this._blockAlignment);

      if (this._syncAlignmentData && this.data && typeof this.data === "object") {
        this.data.alignment = this._blockAlignment;
      }
    }

    _toggleTune(name) {
      if (typeof super._toggleTune === "function") {
        super._toggleTune(name);
      }

      this.setAlignment(name);
    }
  }

  const dataDescriptor = Object.getOwnPropertyDescriptor(Tool.prototype, "data");

  if (dataDescriptor?.get && dataDescriptor?.set) {
    Object.defineProperty(AlignedTool.prototype, "data", {
      configurable: true,
      enumerable: dataDescriptor.enumerable,
      get() {
        return dataDescriptor.get.call(this);
      },
      set(value) {
        const alignment = readBlockAlignment(this._alignElement);
        dataDescriptor.set.call(this, value);

        if (this._element) {
          this._alignElement = this._element;
          this._blockAlignment = alignment;
          applyBlockAlignment(this._element, alignment);
        }
      },
    });
  }

  return AlignedTool;
}

export class TextAlignTool {
  static get isInline() {
    return true;
  }

  static get title() {
    return "정렬";
  }

  constructor({ api }) {
    this.api = api;
    this.button = null;
  }

  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.classList.add(this.api.styles.inlineToolButton);
    this.button.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });
    this.paint("left");
    return this.button;
  }

  surround() {
    const block = this.currentBlock();
    const root = block?.holder?.querySelector("[data-text-align-root]");

    if (!block || !root) {
      return;
    }

    block.call("setAlignment", nextAlignment(readBlockAlignment(root)));
  }

  checkState() {
    const block = this.currentBlock();
    const root = block?.holder?.querySelector("[data-text-align-root]");
    this.paint(readBlockAlignment(root));
    return false;
  }

  currentBlock() {
    const anchor = window.getSelection()?.anchorNode;
    const element =
      anchor?.nodeType === Node.ELEMENT_NODE ? anchor : anchor?.parentElement;
    const holder = element?.closest?.(".ce-block");

    if (holder) {
      const block = this.api.blocks.getBlockByElement(holder);

      if (block) {
        return block;
      }
    }

    const index = this.api.blocks.getCurrentBlockIndex();

    if (index < 0) {
      return null;
    }

    return this.api.blocks.getBlockByIndex(index) ?? null;
  }

  paint(alignment) {
    if (!this.button) {
      return;
    }

    const value = normalizeAlignment(alignment);
    this.button.innerHTML = ALIGN_ICONS[value];
    this.button.title = ALIGN_LABELS[value];
    this.button.classList.toggle(
      this.api.styles.inlineToolButtonActive,
      value !== "left",
    );
  }
}
