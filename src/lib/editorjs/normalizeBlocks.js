export function normalizeBlocks(contents) {
  if (!contents) {
    return [];
  }

  if (Array.isArray(contents)) {
    return contents;
  }

  if (Array.isArray(contents.blocks)) {
    return contents.blocks;
  }

  if (typeof contents === "object" && contents.body) {
    const text = String(contents.body).trim();

    if (!text) {
      return [];
    }

    return [{ type: "paragraph", data: { text } }];
  }

  return [];
}

export function normalizeEditorData(contents) {
  const blocks = normalizeBlocks(contents);

  if (blocks.length === 0) {
    return undefined;
  }

  return { blocks };
}