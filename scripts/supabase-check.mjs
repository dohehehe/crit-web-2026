import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { requireSupabaseEnv } from "./supabase-env.mjs";

const env = requireSupabaseEnv({ needServiceRole: true });

function createNodeClient(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });
}

async function checkRestApi() {
  const response = await fetch(`${env.url}/rest/v1/`, {
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`REST API failed (${response.status} ${response.statusText})`);
  }

  const openapi = await response.json();
  const tables = Object.keys(openapi.paths ?? {})
    .filter((path) => path.startsWith("/") && path.length > 1)
    .map((path) => path.slice(1))
    .sort();

  return tables;
}

async function checkPublishableClient() {
  const client = createNodeClient(env.url, env.anonKey);
  const { error } = await client.auth.getSession();

  if (error) {
    throw new Error(`Publishable key client failed: ${error.message}`);
  }
}

async function checkServiceRoleQuery(tables) {
  if (tables.length === 0) {
    console.log("Service role query: skipped (no tables found)");
    return;
  }

  const client = createNodeClient(env.url, env.serviceRoleKey);
  const table = tables[0];
  const { error } = await client.from(table).select("*").limit(1);

  if (!error) {
    console.log(`Service role query (${table}): OK`);
    return;
  }

  if (error.code === "42501" || error.message.includes("permission denied")) {
    console.log(`Service role query (${table}): skipped (table GRANT not set)`);
    console.log(
      "  hint: run GRANT SELECT ON ALL TABLES IN SCHEMA public TO service_role;"
    );
    return;
  }

  throw new Error(`Service role query failed: ${error.message}`);
}

async function main() {
  console.log("Supabase connection check");
  console.log(`  URL: ${env.url}`);
  console.log("");

  const tables = await checkRestApi();
  console.log(`REST API: OK (${tables.length} tables/views)`);
  console.log(`  ${tables.join(", ")}`);

  await checkPublishableClient();
  console.log("Publishable key client: OK");

  await checkServiceRoleQuery(tables);

  console.log("");
  console.log("All checks passed.");
}

main().catch((error) => {
  console.error("Connection check failed:");
  console.error(`  ${error.message}`);
  process.exit(1);
});
