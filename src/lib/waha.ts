/**
 * WAHA (WhatsApp HTTP API) client utility
 * @see https://waha.devlike.pro/docs/
 */

const WAHA_URL = process.env.WAHA_URL || "http://localhost:3003";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

/**
 * WAHA Core only supports a single session named 'default'.
 * All API calls use this constant regardless of the DB session UUID.
 */
const WAHA_SESSION = "default";

async function wahaFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${WAHA_URL}${path}`, {
    ...options,
    headers: {
      "X-Api-Key": WAHA_API_KEY,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  return res;
}

// --- Session Management ---

/**
 * Webhook URL as seen from WAHA Docker container.
 * Uses WAHA_WEBHOOK_URL (host.docker.internal) for Docker,
 * falls back to NEXT_PUBLIC_APP_URL for non-Docker setups.
 */
function getWebhookUrl(): string {
  const base = process.env.WAHA_WEBHOOK_URL
    || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/wa/webhook`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}secret=${encodeURIComponent(WAHA_API_KEY)}`;
}

export async function createWahaSession() {
  return wahaFetch("/api/sessions", {
    method: "POST",
    body: JSON.stringify({
      name: WAHA_SESSION,
      start: true,
      config: {
        noweb: {
          store: { enabled: true, fullSync: true },
        },
        webhooks: [
          {
            url: getWebhookUrl(),
            events: ["message", "message.any", "message.ack", "session.status"],
          },
        ],
      },
    }),
  });
}

export async function startWahaSession() {
  return wahaFetch(`/api/sessions/${WAHA_SESSION}/start`, { method: "POST" });
}

export async function stopWahaSession() {
  return wahaFetch(`/api/sessions/${WAHA_SESSION}/stop`, { method: "POST" });
}

export async function deleteWahaSession() {
  return wahaFetch(`/api/sessions/${WAHA_SESSION}`, { method: "DELETE" });
}

export async function getWahaQR(): Promise<string | null> {
  const res = await wahaFetch(`/api/${WAHA_SESSION}/auth/qr`, {
    method: "GET",
    headers: { Accept: "image/png" },
  });
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:image/png;base64,${base64}`;
}

export async function getWahaSessionInfo() {
  return wahaFetch(`/api/sessions/${WAHA_SESSION}`, { method: "GET" });
}

// --- LID Resolution ---

/** Resolve a @lid identifier to a @c.us phone number via WAHA store */
export async function resolveLidToPhone(lid: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(lid);
    const res = await wahaFetch(`/api/${WAHA_SESSION}/lids/${encoded}`, { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    // data.pn is like "6281234567890@c.us" or null
    return data.pn ? data.pn.replace(/@.*$/, "") : null;
  } catch {
    return null;
  }
}

// --- Messaging ---

export async function sendText(chatId: string, text: string) {
  return wahaFetch("/api/sendText", {
    method: "POST",
    body: JSON.stringify({ session: WAHA_SESSION, chatId, text }),
  });
}

export async function sendImage(
  chatId: string,
  mediaUrl: string,
  caption?: string
) {
  return wahaFetch("/api/sendImage", {
    method: "POST",
    body: JSON.stringify({
      session: WAHA_SESSION,
      chatId,
      file: { url: mediaUrl },
      caption: caption || undefined,
    }),
  });
}

export async function sendFile(
  chatId: string,
  mediaUrl: string,
  fileName?: string
) {
  return wahaFetch("/api/sendFile", {
    method: "POST",
    body: JSON.stringify({
      session: WAHA_SESSION,
      chatId,
      file: { url: mediaUrl, filename: fileName || "file" },
    }),
  });
}

export async function sendSeen(chatId: string) {
  return wahaFetch("/api/sendSeen", {
    method: "POST",
    body: JSON.stringify({ session: WAHA_SESSION, chatId }),
  });
}
