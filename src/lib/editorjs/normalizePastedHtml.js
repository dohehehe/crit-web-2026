const BLOCK_TAGS = new Set([
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "figure",
  "figcaption",
  "pre",
]);

function fontWeight(element) {
  return (element.style?.fontWeight || "").trim().toLowerCase();
}

function isBoldWeight(value) {
  if (value === "bold" || value === "bolder") {
    return true;
  }

  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric >= 600;
}

function isNormalWeight(value) {
  if (value === "normal" || value === "lighter") {
    return true;
  }

  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric > 0 && numeric < 600;
}

function decorationText(element) {
  return `${element.style?.textDecorationLine || ""} ${element.style?.textDecoration || ""}`
    .trim()
    .toLowerCase();
}

function explicitColor(element) {
  const styleColor = (element.style?.color || "").trim();

  if (styleColor) {
    return styleColor;
  }

  if (element.tagName === "FONT") {
    return (element.getAttribute("color") || "").trim() || null;
  }

  return null;
}

function resolveInlineStyle(textNode, root) {
  let bold = null;
  let italic = null;
  let underline = null;
  let color = null;
  let element = textNode.parentElement;

  while (element) {
    const tag = element.tagName.toLowerCase();
    const weight = fontWeight(element);
    const fontStyle = (element.style?.fontStyle || "").trim().toLowerCase();
    const decoration = decorationText(element);

    if (bold === null) {
      if (isBoldWeight(weight)) {
        bold = true;
      } else if (isNormalWeight(weight)) {
        bold = false;
      } else if (tag === "b" || tag === "strong") {
        bold = true;
      }
    }

    if (italic === null) {
      if (fontStyle === "italic" || fontStyle === "oblique") {
        italic = true;
      } else if (fontStyle === "normal") {
        italic = false;
      } else if (tag === "i" || tag === "em") {
        italic = true;
      }
    }

    if (underline === null) {
      if (decoration.includes("underline")) {
        underline = true;
      } else if (decoration.includes("none")) {
        underline = false;
      } else if (tag === "u") {
        underline = true;
      }
    }

    if (color === null) {
      color = explicitColor(element);
    }

    if (element === root) {
      break;
    }

    element = element.parentElement;
  }

  return {
    bold: bold === true,
    italic: italic === true,
    underline: underline === true,
    color,
  };
}

function wrapText(textNode, root) {
  if (!textNode.textContent) {
    return null;
  }

  const style = resolveInlineStyle(textNode, root);
  let node = textNode.ownerDocument.createTextNode(textNode.textContent);

  if (style.underline) {
    const underline = textNode.ownerDocument.createElement("u");
    underline.className = "cdx-underline";
    underline.appendChild(node);
    node = underline;
  }

  if (style.italic) {
    const italic = textNode.ownerDocument.createElement("i");
    italic.appendChild(node);
    node = italic;
  }

  if (style.bold) {
    const bold = textNode.ownerDocument.createElement("b");
    bold.appendChild(node);
    node = bold;
  }

  if (style.color) {
    const colored = textNode.ownerDocument.createElement("font");
    colored.style.color = style.color;
    colored.appendChild(node);
    node = colored;
  }

  return node;
}

function rebuildNode(node, root) {
  if (node.nodeType === Node.TEXT_NODE) {
    return wrapText(node, root);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.tagName.toLowerCase();

  if (tag === "br") {
    return node.cloneNode();
  }

  if (tag === "a" && node.getAttribute("href")) {
    const link = node.ownerDocument.createElement("a");
    link.setAttribute("href", node.getAttribute("href"));

    for (const child of node.childNodes) {
      const next = rebuildNode(child, root);
      if (next) {
        link.append(next);
      }
    }

    return link;
  }

  if (BLOCK_TAGS.has(tag)) {
    const block = node.ownerDocument.createElement(tag);

    for (const child of node.childNodes) {
      const next = rebuildNode(child, root);
      if (next) {
        block.append(next);
      }
    }

    return block;
  }

  const fragment = node.ownerDocument.createDocumentFragment();

  for (const child of node.childNodes) {
    const next = rebuildNode(child, root);
    if (next) {
      fragment.append(next);
    }
  }

  return fragment;
}

const MERGEABLE_TAGS = new Set(["A", "B", "I", "U", "FONT"]);

function sameInlineElement(left, right) {
  if (left.nodeType !== Node.ELEMENT_NODE || right.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  if (!MERGEABLE_TAGS.has(left.tagName)) {
    return false;
  }

  if (left.tagName === "FONT") {
    return left.style.color === right.style.color;
  }

  return (
    left.tagName === right.tagName &&
    left.className === right.className &&
    left.getAttribute("href") === right.getAttribute("href")
  );
}

function mergeAdjacent(element) {
  let child = element.firstChild;

  while (child) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      mergeAdjacent(child);
    }

    const next = child.nextSibling;

    if (
      next &&
      child.nodeType === Node.TEXT_NODE &&
      next.nodeType === Node.TEXT_NODE
    ) {
      child.textContent += next.textContent;
      next.remove();
      continue;
    }

    if (next && sameInlineElement(child, next)) {
      while (next.firstChild) {
        child.appendChild(next.firstChild);
      }

      next.remove();
      mergeAdjacent(child);
      continue;
    }

    child = next;
  }
}

export function normalizePastedHtml(html) {
  if (!html || !html.includes("<")) {
    return html;
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const holder = document.createElement("div");

  for (const child of document.body.childNodes) {
    const next = rebuildNode(child, document.body);
    if (next) {
      holder.append(next);
    }
  }

  mergeAdjacent(holder);
  return holder.innerHTML;
}

export function attachRichTextPaste(holder) {
  const onPaste = (event) => {
    if (event.critNormalizedPaste) {
      return;
    }

    const clipboard = event.clipboardData;

    if (!clipboard || clipboard.types?.includes("Files")) {
      return;
    }

    const html = clipboard.getData("text/html");

    if (!html) {
      return;
    }

    const normalized = normalizePastedHtml(html);

    if (!normalized || normalized === html) {
      return;
    }

    const readClipboard = clipboard.getData.bind(clipboard);

    try {
      clipboard.getData = (type) =>
        type === "text/html" ? normalized : readClipboard(type);
      return;
    } catch {
      // Clipboard data can be read-only. Fall through to a synthetic paste.
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const transfer = new DataTransfer();
    transfer.setData("text/html", normalized);
    const plain = readClipboard("text/plain");

    if (plain) {
      transfer.setData("text/plain", plain);
    }

    const nextPaste = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(nextPaste, "clipboardData", { value: transfer });
    nextPaste.critNormalizedPaste = true;
    event.target.dispatchEvent(nextPaste);
  };

  holder.addEventListener("paste", onPaste, true);

  return () => {
    holder.removeEventListener("paste", onPaste, true);
  };
}
