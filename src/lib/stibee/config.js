import "server-only";

export const STIBEE_API_BASE = "https://api.stibee.com/v2";

export function getStibeeConfig() {
  const apiKey = process.env.STIBEE_API_KEY;
  const listId = process.env.STIBEE_LIST_ID;

  if (!apiKey || !listId) {
    throw new Error("Missing STIBEE_API_KEY or STIBEE_LIST_ID (server-only)");
  }

  return { apiKey, listId };
}
