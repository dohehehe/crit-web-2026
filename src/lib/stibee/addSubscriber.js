import "server-only";

const STIBEE_API_BASE = "https://api.stibee.com/v2";

function getStibeeConfig() {
  const apiKey = process.env.STIBEE_API_KEY;
  const listId = process.env.STIBEE_LIST_ID;

  if (!apiKey || !listId) {
    throw new Error("Missing STIBEE_API_KEY or STIBEE_LIST_ID (server-only)");
  }

  return { apiKey, listId };
}

export async function addStibeeSubscriber({ email, name, marketingAllowed }) {
  const { apiKey, listId } = getStibeeConfig();

  const response = await fetch(
    `${STIBEE_API_BASE}/lists/${listId}/subscribers`,
    {
      method: "POST",
      headers: {
        AccessToken: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriber: {
          email,
          status: "subscribed",
          marketingAllowed: Boolean(marketingAllowed),
          fields: {
            name,
          },
        },
      }),
    }
  );

  if (response.ok) {
    return;
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (payload?.code === "Errors.List.AlreadyExistEmail") {
    return;
  }

  throw new Error(
    payload?.message ?? `Stibee subscriber add failed (${response.status})`
  );
}
