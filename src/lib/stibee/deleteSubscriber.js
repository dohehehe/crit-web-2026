import "server-only";

import { getStibeeConfig, STIBEE_API_BASE } from "@/lib/stibee/config";

export async function deleteStibeeSubscriber({ email }) {
  const { apiKey, listId } = getStibeeConfig();

  const response = await fetch(
    `${STIBEE_API_BASE}/lists/${listId}/subscribers`,
    {
      method: "DELETE",
      headers: {
        AccessToken: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribers: [email],
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

  if (payload?.code === "Errors.List.NotExistEmail") {
    return;
  }

  throw new Error(
    payload?.message ?? `Stibee subscriber delete failed (${response.status})`
  );
}
