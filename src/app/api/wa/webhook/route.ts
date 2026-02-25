import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getWahaQR, getWahaSessionInfo, resolveLidToPhone } from "@/lib/waha";
import crypto from "crypto";

const WAHA_URL = process.env.WAHA_URL || "http://localhost:3003";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

// --- Helpers ---

/** Extract phone number from chatId, e.g. "6281234567890@c.us" → "6281234567890" */
function extractPhone(chatId: string): string {
  return chatId.replace(/@.*$/, "");
}

/** Determine message type from WAHA payload */
function resolveMessageType(
  payload: Record<string, unknown>
): "text" | "image" | "document" | "video" | "audio" | "sticker" | "location" | "contact" {
  if (payload.hasMedia) {
    const mimetype = (payload.mimetype as string) || "";
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    if (mimetype.startsWith("audio/")) return "audio";
    return "document";
  }
  return "text";
}

/** Map WAHA ack number to our status string */
function ackToStatus(ack: number): "sent" | "delivered" | "read" {
  if (ack >= 3) return "read";
  if (ack >= 2) return "delivered";
  return "sent";
}

// --- Main Handler ---

export async function POST(req: NextRequest) {
  // Security: validate webhook secret via query parameter or custom header
  const urlSecret = req.nextUrl.searchParams.get("secret");
  const headerSecret = req.headers.get("x-webhook-secret");
  if (!WAHA_API_KEY || (urlSecret !== WAHA_API_KEY && headerSecret !== WAHA_API_KEY)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { event, payload } = body;

  console.log(`[WAHA Webhook] Event: ${event}`,
    (event === "message" || event === "message.any")
      ? JSON.stringify(payload, null, 2).substring(0, 2000)
      : {}
  );

  // Service client bypasses RLS (server-to-server webhook)
  const supabase = await createSupabaseServiceClient();

  try {
    switch (event) {
      case "message":
        await handleMessage(supabase, payload);
        break;
      case "message.any":
        // Fallback: message.any fires for ALL messages (in+out)
        // Only handle inbound here (fromMe === false) as backup for "message" event
        if (!payload.fromMe) {
          await handleMessage(supabase, payload);
        }
        break;
      case "message.ack":
        await handleMessageAck(supabase, payload);
        break;
      case "session.status":
        await handleSessionStatus(supabase, payload);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[WAHA Webhook] Error handling event "${event}":`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// --- Event Handlers ---

async function handleMessage(
  supabase: Awaited<ReturnType<typeof createSupabaseServiceClient>>,
  payload: Record<string, unknown>
) {
  // Skip outbound messages from us
  if (payload.fromMe) return;

  const chatId = payload.from as string;
  let phone = extractPhone(chatId);
  const messageBody = (payload.body as string) || "";
  const messageId = payload.id as string;
  const timestamp = payload.timestamp as number;
  const hasMedia = payload.hasMedia as boolean;

  // If chatId is LID format (@lid), try to resolve to real phone number
  if (chatId.endsWith("@lid")) {
    const resolved = await resolveLidToPhone(chatId);
    if (resolved) {
      phone = resolved;
      console.log(`[WAHA Webhook] Resolved LID ${chatId} → ${phone}`);
    } else {
      console.log(`[WAHA Webhook] Could not resolve LID ${chatId}, using raw ID`);
    }
  }

  const notifyName =
    (payload._data as Record<string, unknown>)?.notifyName as string || phone;

  // 1. Find active WAHA session by provider (WAHA Core only has 'default' session)
  const { data: session } = await supabase
    .from("wa_sessions")
    .select("id, org_id")
    .eq("provider", "waha")
    .neq("status", "disconnected")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    console.error("[WAHA Webhook] No active WAHA session found");
    return;
  }

  // 2. Auto-link: search contacts by whatsapp or phone matching extracted phone
  let contactId: string | null = null;
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id")
    .eq("org_id", session.org_id)
    .or(`whatsapp.eq.${phone},phone.eq.${phone}`)
    .limit(1);

  if (contacts && contacts.length > 0) {
    contactId = contacts[0].id;
  }

  // 3. Upsert wa_conversations
  const preview = messageBody.substring(0, 100) || (hasMedia ? "[Media]" : "");
  const messageAt = timestamp
    ? new Date(timestamp * 1000).toISOString()
    : new Date().toISOString();

  const { data: conv } = await supabase
    .from("wa_conversations")
    .upsert(
      {
        org_id: session.org_id,
        session_id: session.id,
        remote_jid: chatId,
        remote_name: notifyName,
        phone_number: phone,
        provider: "waha",
        status: "open",
        last_message_preview: preview,
        last_message_at: messageAt,
        ...(contactId ? { contact_id: contactId } : {}),
      },
      { onConflict: "session_id,remote_jid" }
    )
    .select("id, contact_id")
    .single();

  if (!conv) {
    console.error("[WAHA Webhook] Failed to upsert conversation");
    return;
  }

  // If conversation already existed without a contact_id, try to link now
  if (!conv.contact_id && contactId) {
    await supabase
      .from("wa_conversations")
      .update({ contact_id: contactId })
      .eq("id", conv.id);
  }

  // Also update preview/name on existing conversations (upsert may not update all fields)
  await supabase
    .from("wa_conversations")
    .update({
      remote_name: notifyName,
      last_message_preview: preview,
      last_message_at: messageAt,
    })
    .eq("id", conv.id);

  // 4. Handle media: download from WAHA and upload to Supabase Storage
  let mediaUrl: string | null = null;
  const msgType = resolveMessageType(payload);

  if (hasMedia && messageId) {
    try {
      const wahaMediaRes = await fetch(
        `${WAHA_URL}/api/media?message_id=${encodeURIComponent(messageId)}&session=default`,
        {
          headers: { "X-Api-Key": WAHA_API_KEY },
        }
      );

      if (wahaMediaRes.ok) {
        const mediaBuffer = Buffer.from(await wahaMediaRes.arrayBuffer());
        const mimetype = (payload.mimetype as string) || "application/octet-stream";
        const ext = mimetype.split("/")[1]?.split(";")[0] || "bin";
        const fileName = `${session.org_id}/${crypto.randomUUID()}.${ext}`;

        const { data: uploaded } = await supabase.storage
          .from("wa-media")
          .upload(fileName, mediaBuffer, {
            contentType: mimetype,
            upsert: false,
          });

        if (uploaded?.path) {
          const { data: urlData } = supabase.storage
            .from("wa-media")
            .getPublicUrl(uploaded.path);
          mediaUrl = urlData?.publicUrl || null;
        }
      }
    } catch (err) {
      console.error("[WAHA Webhook] Media download/upload failed:", err);
    }
  }

  // 5. Insert wa_messages (skip if duplicate from message+message.any both firing)
  const { error: insertErr } = await supabase.from("wa_messages").insert({
    conversation_id: conv.id,
    wa_message_id: messageId,
    direction: "inbound",
    type: msgType,
    body: messageBody,
    media_url: mediaUrl,
    sender_name: notifyName,
    status: "delivered",
  });
  if (insertErr) {
    // Likely duplicate wa_message_id — skip silently
    console.log("[WAHA Webhook] Message insert skipped (duplicate?):", insertErr.message);
    return;
  }

  // 6. Increment unread
  await supabase.rpc("increment_unread", { conv_id: conv.id });
}

async function handleMessageAck(
  supabase: Awaited<ReturnType<typeof createSupabaseServiceClient>>,
  payload: Record<string, unknown>
) {
  const messageId = payload.id as string;
  const ack = payload.ack as number;
  if (!messageId || ack === undefined) return;

  const status = ackToStatus(ack);

  await supabase
    .from("wa_messages")
    .update({ status })
    .eq("wa_message_id", messageId);
}

async function handleSessionStatus(
  supabase: Awaited<ReturnType<typeof createSupabaseServiceClient>>,
  payload: Record<string, unknown>
) {
  const wahaStatus = payload.status as string;

  // Find latest WAHA session in DB regardless of status
  // (session may be "disconnected" after restart — SCAN_QR_CODE still needs to update it)
  const { data: session } = await supabase
    .from("wa_sessions")
    .select("id, org_id")
    .eq("provider", "waha")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    console.error("[WAHA Webhook] No WAHA session found for status update");
    return;
  }

  switch (wahaStatus) {
    case "SCAN_QR_CODE": {
      const qr = await getWahaQR();
      await supabase
        .from("wa_sessions")
        .update({
          status: "qr_pending",
          qr_code_data: qr,
        })
        .eq("id", session.id);
      break;
    }

    case "WORKING": {
      let phoneNumber: string | null = null;
      try {
        const infoRes = await getWahaSessionInfo();
        if (infoRes.ok) {
          const info = await infoRes.json();
          phoneNumber = info.me?.id ? extractPhone(info.me.id) : null;
        }
      } catch {
        // Non-critical
      }

      await supabase
        .from("wa_sessions")
        .update({
          status: "connected",
          qr_code_data: null,
          connected_at: new Date().toISOString(),
          ...(phoneNumber ? { phone_number: phoneNumber } : {}),
        })
        .eq("id", session.id);
      break;
    }

    case "STOPPED":
    case "FAILED": {
      await supabase
        .from("wa_sessions")
        .update({
          status: "disconnected",
          qr_code_data: null,
        })
        .eq("id", session.id);
      break;
    }

    default:
      break;
  }
}
