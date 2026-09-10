const FOOTNOTE_SUP_PATTERN =
  /<sup[^>]*data-tune=["']footnotes["'][^>]*>.*?<\/sup>/gi;

export function normalizeFootnotes(footnotes) {
  if (!Array.isArray(footnotes) || footnotes.length === 0) {
    return [];
  }

  return footnotes.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: String(index),
        content: item,
        superscript: index + 1,
      };
    }

    return {
      id: item?.id ?? String(index),
      content: item?.content ?? "",
      superscript: item?.superscript ?? index + 1,
    };
  });
}

export function createFootnoteContext(blocks) {
  const entries = [];
  let displayNumber = 0;

  blocks.forEach((block) => {
    normalizeFootnotes(block.tunes?.footnotes).forEach((note) => {
      displayNumber += 1;
      entries.push({
        ...note,
        superscript: displayNumber,
        footnoteId: `fn-${displayNumber}`,
      });
    });
  });

  const counter = { index: 0 };

  return {
    entries,
    applyToHtml(html) {
      if (!html || entries.length === 0) {
        return html ?? "";
      }

      return html.replace(FOOTNOTE_SUP_PATTERN, () => {
        const note = entries[counter.index];

        if (!note) {
          counter.index += 1;
          return "";
        }

        counter.index += 1;

        return `<sup class="footnote-ref"><a href="#${note.footnoteId}" id="${note.footnoteId}-ref">${note.superscript}</a></sup>`;
      });
    },
  };
}
