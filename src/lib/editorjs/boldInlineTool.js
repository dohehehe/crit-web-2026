const BOLD_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M9 12L9 7.1C9 7.04477 9.04477 7 9.1 7H10.4C11.5 7 14 7.1 14 9.5C14 9.5 14 12 11 12M9 12V16.8C9 16.9105 9.08954 17 9.2 17H12.5C14 17 15 16 15 14.5C15 11.7046 11 12 11 12M9 12H11"/></svg>';

function closestBold(node) {
  const element = node instanceof Element ? node : node?.parentElement;

  return element?.closest("b, strong") ?? null;
}

function textNodesIn(range) {
  const root =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;

  if (!root) {
    return [];
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let current = walker.nextNode();

  while (current) {
    if (current.textContent && range.intersectsNode(current)) {
      nodes.push(current);
    }

    current = walker.nextNode();
  }

  return nodes;
}

function entirelyBold(range) {
  const nodes = textNodesIn(range);

  return nodes.length > 0 && nodes.every((node) => closestBold(node));
}

function unwrapElement(element) {
  const parent = element.parentNode;

  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  element.remove();
}

function splitElementBefore(element, container, offset) {
  if (!element.contains(container)) {
    return;
  }

  const before = document.createRange();
  before.selectNodeContents(element);
  before.setEnd(container, offset);

  if (!before.toString()) {
    return;
  }

  const clone = element.cloneNode(false);
  clone.appendChild(before.extractContents());
  element.parentNode.insertBefore(clone, element);
}

function isolateBold(element, range) {
  if (element.contains(range.startContainer)) {
    splitElementBefore(element, range.startContainer, range.startOffset);
  }

  if (!element.contains(range.endContainer)) {
    return element;
  }

  const after = document.createRange();
  after.selectNodeContents(element);
  after.setStart(range.endContainer, range.endOffset);

  if (!after.toString()) {
    return element;
  }

  const selected = document.createRange();
  selected.selectNodeContents(element);
  selected.setEnd(range.endContainer, range.endOffset);

  const clone = element.cloneNode(false);
  clone.appendChild(selected.extractContents());
  element.parentNode.insertBefore(clone, element);

  if (!element.textContent) {
    element.remove();
  }

  return clone;
}

function removeBold(range) {
  for (let guard = 0; guard < 8; guard += 1) {
    const bold = textNodesIn(range).map(closestBold).find(Boolean);

    if (!bold) {
      break;
    }

    unwrapElement(isolateBold(bold, range));
  }
}

function selectNodeContents(element) {
  const selection = window.getSelection();
  const next = document.createRange();
  next.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(next);
}

function applyBold(range) {
  const contents = range.extractContents();
  contents.querySelectorAll("b, strong").forEach(unwrapElement);

  if (!contents.textContent) {
    range.insertNode(contents);
    return;
  }

  const bold = document.createElement("b");
  bold.append(contents);
  range.insertNode(bold);
  selectNodeContents(bold);
}

export class BoldInlineTool {
  static get isInline() {
    return true;
  }

  static get title() {
    return "Bold";
  }

  static get sanitize() {
    return {
      b: {},
    };
  }

  constructor() {
    this.button = null;
  }

  render() {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("ce-inline-tool");
    button.innerHTML = BOLD_ICON;
    this.button = button;
    return button;
  }

  surround(range) {
    const selection = window.getSelection();
    const current =
      range && !range.collapsed
        ? range
        : selection?.rangeCount
          ? selection.getRangeAt(0)
          : null;

    if (!current || current.collapsed) {
      return;
    }

    if (entirelyBold(current)) {
      removeBold(current);
      return;
    }

    applyBold(current);
  }

  checkState() {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const active = Boolean(range && !range.collapsed && entirelyBold(range));

    this.button?.classList.toggle("ce-inline-tool--active", active);
    return active;
  }

  get shortcut() {
    return "CMD+B";
  }
}
