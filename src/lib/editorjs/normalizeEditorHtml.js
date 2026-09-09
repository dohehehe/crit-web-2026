export function normalizeEditorHtml(html) {
  if (!html) {
    return html;
  }

  return html.replace(/&nbsp;/gi, " ").replace(/\u00A0/g, " ");
}

export function getCaptionPlainText(html) {
  if (!html) {
    return "";
  }

  return normalizeEditorHtml(html).replace(/<[^>]*>/g, "").trim();
}