import { syncSchema } from "./supabase-schema.mjs";

const DEFAULT_INTERVAL_MS = 10_000;

function parseIntervalMs() {
  const arg = process.argv.find((value) => value.startsWith("--interval="));
  if (!arg) return DEFAULT_INTERVAL_MS;

  const parsed = Number.parseInt(arg.split("=")[1], 10);
  if (!Number.isFinite(parsed) || parsed < 3_000) {
    throw new Error("Interval must be at least 3000ms (--interval=5000)");
  }

  return parsed;
}

async function runWatch() {
  const intervalMs = parseIntervalMs();

  console.log("Watching Supabase schema changes...");
  console.log(`  interval: ${intervalMs}ms`);
  console.log("  output: supabase/schema.json, supabase/schema.md");
  console.log("  press Ctrl+C to stop");
  console.log("");

  const tick = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const result = await syncSchema({ quiet: true });

      if (result.changed) {
        console.log(`[${timestamp}] schema updated (${result.schema.tables.length} tables)`);
        for (const change of result.changes) {
          console.log(`  ${change}`);
        }
      } else {
        console.log(`[${timestamp}] no changes`);
      }
    } catch (error) {
      console.error(`[${timestamp}] error: ${error.message}`);
    }
  };

  await tick();
  setInterval(tick, intervalMs);
}

runWatch().catch((error) => {
  console.error("Schema watch failed:");
  console.error(`  ${error.message}`);
  process.exit(1);
});
