import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env", ".env.local"]) {
  const path = resolve(root, file);
  if (existsSync(path)) {
    config({ path, override: false });
  }
}

export { root };
