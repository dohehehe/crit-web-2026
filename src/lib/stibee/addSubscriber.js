import "server-only";

import { getStibeeConfig, STIBEE_API_BASE } from "@/lib/stibee/config";

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
