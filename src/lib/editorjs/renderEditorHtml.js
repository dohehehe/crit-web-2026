const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "br",
  "code",
  "del",
  "em",
  "font",
  "i",
  "mark",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
]);

const TAG_PATTERN = /^<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*\/?>$/;
const ENTITY_PATTERN = /&(#x[0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]+);/g;

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  laquo: "\u00AB",
  raquo: "\u00BB",
  lsaquo: "\u2039",
  rsaquo: "\u203A",
  lsquo: "\u2018",
  rsquo: "\u2019",
  sbquo: "\u201A",
  ldquo: "\u201C",
  rdquo: "\u201D",
  bdquo: "\u201E",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  minus: "\u2212",
  bull: "\u2022",
  middot: "\u00B7",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  deg: "\u00B0",
  plusmn: "\u00B1",
  times: "\u00D7",
  divide: "\u00F7",
  frac14: "\u00BC",
  frac12: "\u00BD",
  frac34: "\u00BE",
  sup1: "\u00B9",
  sup2: "\u00B2",
  sup3: "\u00B3",
  sect: "\u00A7",
  para: "\u00B6",
  dagger: "\u2020",
  Dagger: "\u2021",
  permil: "\u2030",
  prime: "\u2032",
  Prime: "\u2033",
  larr: "\u2190",
  rarr: "\u2192",
  uarr: "\u2191",
  darr: "\u2193",
  harr: "\u2194",
  le: "\u2264",
  ge: "\u2265",
  ne: "\u2260",
  inf: "\u221E",
  radic: "\u221A",
  asymp: "\u2248",
  equiv: "\u2261",
  euro: "\u20AC",
  pound: "\u00A3",
  yen: "\u00A5",
  cent: "\u00A2",
  curren: "\u00A4",
  iexcl: "\u00A1",
  iquest: "\u00BF",
  brvbar: "\u00A6",
  not: "\u00AC",
  micro: "\u00B5",
  macr: "\u00AF",
  acute: "\u00B4",
  cedil: "\u00B8",
  uml: "\u00A8",
  ordm: "\u00BA",
  ordf: "\u00AA",
  circ: "\u02C6",
  tilde: "\u02DC",
};

function lookupNamedEntity(body) {
  if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body)) {
    return NAMED_ENTITIES[body];
  }

  const lower = body.toLowerCase();

  if (lower !== body && Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, lower)) {
    return NAMED_ENTITIES[lower];
  }

  return null;
}

function decodeEntityBody(body) {
  if (body[0] === "#") {
    const hex = body[1] === "x" || body[1] === "X";
    const code = hex
      ? Number.parseInt(body.slice(2), 16)
      : Number.parseInt(body.slice(1), 10);

    if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) {
      return null;
    }

    if (code >= 0xd800 && code <= 0xdfff) {
      return null;
    }

    return String.fromCodePoint(code);
  }

  return lookupNamedEntity(body);
}

function decodeEntities(text) {
  let value = text;

  for (let pass = 0; pass < 3; pass += 1) {
    let changed = false;
    const next = value.replace(ENTITY_PATTERN, (entity, body) => {
      const decoded = decodeEntityBody(body);

      if (decoded == null) {
        return entity;
      }

      changed = true;
      return decoded;
    });

    value = next;

    if (!changed) {
      break;
    }
  }

  return value;
}

function escapeText(text) {
  return text
    .replace(/&(?!(#x[0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]+);)/g, "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderText(text) {
  return escapeText(decodeEntities(text));
}

function isAllowedTag(token) {
  const match = TAG_PATTERN.exec(token);

  if (!match) {
    return false;
  }

  return ALLOWED_TAGS.has(match[1].toLowerCase());
}

export function renderEditorHtml(html) {
  if (!html) {
    return "";
  }

  const value = String(html);
  let result = "";
  let index = 0;

  while (index < value.length) {
    const open = value.indexOf("<", index);

    if (open === -1) {
      result += renderText(value.slice(index));
      break;
    }

    result += renderText(value.slice(index, open));
    const close = value.indexOf(">", open + 1);

    if (close === -1) {
      result += renderText(value.slice(open));
      break;
    }

    const token = value.slice(open, close + 1);

    if (isAllowedTag(token)) {
      result += token;
    } else {
      result += renderText(token);
    }

    index = close + 1;
  }

  return result;
}

export function editorHtmlToPlainText(html) {
  if (!html) {
    return "";
  }

  return decodeEntities(renderEditorHtml(html).replace(/<[^>]*>/g, ""))
    .replace(/\u00A0/g, " ")
    .trim();
}
