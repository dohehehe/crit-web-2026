import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { requireSupabaseEnv } from "./supabase-env.mjs";
import { root } from "./load-env.mjs";

const OUTPUT_DIR = resolve(root, "supabase");
const JSON_PATH = resolve(OUTPUT_DIR, "schema.json");
const MD_PATH = resolve(OUTPUT_DIR, "schema.md");

function parseColumnNotes(description = "") {
  const notes = [];
  if (description.includes("<pk/>")) notes.push("PK");
  const fkMatch = description.match(
    /<fk table='([^']+)' column='([^']+)'\/>/
  );
  if (fkMatch) notes.push(`FK → ${fkMatch[1]}.${fkMatch[2]}`);
  return notes;
}

function normalizeType(property = {}) {
  const format = property.format ?? property.type ?? "unknown";
  if (property.type === "array") {
    const itemType = property.items?.format ?? property.items?.type ?? "unknown";
    return `array<${itemType}>`;
  }
  return format;
}

function buildSchema(openapi) {
  const definitions = openapi.definitions ?? openapi.components?.schemas ?? {};
  const paths = Object.keys(openapi.paths ?? {})
    .filter((path) => path.startsWith("/") && path.length > 1)
    .map((path) => path.slice(1))
    .sort();

  const tables = paths.map((name) => {
    const definition = definitions[name] ?? {};
    const required = new Set(definition.required ?? []);
    const properties = definition.properties ?? {};

    const columns = Object.entries(properties)
      .map(([columnName, property]) => ({
        name: columnName,
        type: normalizeType(property),
        required: required.has(columnName),
        default: property.default ?? null,
        notes: parseColumnNotes(property.description ?? ""),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { name, columns };
  });

  return {
    generatedAt: new Date().toISOString(),
    projectUrl: openapi.servers?.[0]?.url ?? null,
    tables,
  };
}

function renderMarkdown(schema) {
  const lines = [
    "# Supabase Schema",
    "",
    `> Auto-generated. Run \`npm run supabase:schema\` to refresh.`,
    "",
    `- Updated: ${schema.generatedAt}`,
    `- Tables: ${schema.tables.length}`,
    "",
  ];

  for (const table of schema.tables) {
    lines.push(`## \`${table.name}\``, "");
    lines.push("| Column | Type | Required | Default | Notes |");
    lines.push("| --- | --- | --- | --- | --- |");

    for (const column of table.columns) {
      lines.push(
        `| \`${column.name}\` | ${column.type} | ${column.required ? "yes" : "no"} | ${column.default ?? ""} | ${column.notes.join(", ")} |`
      );
    }

    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function schemaHash(schema) {
  const payload = schema.tables.map((table) => ({
    name: table.name,
    columns: table.columns.map((column) => ({
      name: column.name,
      type: column.type,
      required: column.required,
      default: column.default,
      notes: column.notes,
    })),
  }));

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function diffSchemas(previous, next) {
  const prevMap = new Map(previous.tables.map((table) => [table.name, table]));
  const nextMap = new Map(next.tables.map((table) => [table.name, table]));
  const changes = [];

  for (const name of nextMap.keys()) {
    if (!prevMap.has(name)) {
      changes.push(`+ table added: ${name}`);
    }
  }

  for (const name of prevMap.keys()) {
    if (!nextMap.has(name)) {
      changes.push(`- table removed: ${name}`);
    }
  }

  for (const [name, nextTable] of nextMap.entries()) {
    const prevTable = prevMap.get(name);
    if (!prevTable) continue;

    const prevCols = new Map(prevTable.columns.map((c) => [c.name, c]));
    const nextCols = new Map(nextTable.columns.map((c) => [c.name, c]));

    for (const colName of nextCols.keys()) {
      if (!prevCols.has(colName)) {
        changes.push(`+ column added: ${name}.${colName}`);
      }
    }

    for (const colName of prevCols.keys()) {
      if (!nextCols.has(colName)) {
        changes.push(`- column removed: ${name}.${colName}`);
      }
    }

    for (const [colName, nextCol] of nextCols.entries()) {
      const prevCol = prevCols.get(colName);
      if (!prevCol) continue;

      const prevSig = JSON.stringify({
        type: prevCol.type,
        required: prevCol.required,
        default: prevCol.default,
        notes: prevCol.notes,
      });
      const nextSig = JSON.stringify({
        type: nextCol.type,
        required: nextCol.required,
        default: nextCol.default,
        notes: nextCol.notes,
      });

      if (prevSig !== nextSig) {
        changes.push(`~ column changed: ${name}.${colName}`);
      }
    }
  }

  return changes;
}

async function fetchOpenApi(env) {
  const response = await fetch(`${env.url}/rest/v1/`, {
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Schema fetch failed (${response.status} ${response.statusText})`);
  }

  return response.json();
}

async function readPreviousSchema() {
  try {
    const raw = await readFile(JSON_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function syncSchema({ quiet = false } = {}) {
  const env = requireSupabaseEnv({ needServiceRole: true });
  const openapi = await fetchOpenApi(env);
  const schema = buildSchema(openapi);
  const hash = schemaHash(schema);
  const previous = await readPreviousSchema();
  const previousHash = previous ? schemaHash(previous) : null;

  if (hash === previousHash) {
    if (!quiet) {
      console.log("Schema unchanged.");
      console.log(`  ${schema.tables.length} tables | hash ${hash.slice(0, 8)}`);
    }
    return { changed: false, schema, hash, changes: [] };
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(JSON_PATH, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
  await writeFile(MD_PATH, renderMarkdown(schema), "utf8");

  const changes = previous ? diffSchemas(previous, schema) : ["initial sync"];

  if (!quiet) {
    console.log("Schema updated.");
    console.log(`  ${schema.tables.length} tables | hash ${hash.slice(0, 8)}`);
    console.log(`  wrote ${JSON_PATH}`);
    console.log(`  wrote ${MD_PATH}`);
    for (const change of changes) {
      console.log(`  ${change}`);
    }
  }

  return { changed: true, schema, hash, changes };
}

async function main() {
  await syncSchema();
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error("Schema sync failed:");
    console.error(`  ${error.message}`);
    process.exit(1);
  });
}
