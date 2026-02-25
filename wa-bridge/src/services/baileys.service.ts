import makeWASocket, {
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WAMessageContent,
  getContentType,
  Contact,
  downloadMediaMessage,
} from '@whiskeysockets/baileys';
import * as crypto from 'crypto';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import { getSupabase } from './supabase.service';
import { useSupabaseAuthState } from './auth-state.service';
import { logger } from '../config';

interface SessionEntry {
  socket: WASocket;
  orgId: string;
}

const sessions = new Map<string, SessionEntry>();

export function getSession(sessionId: string): SessionEntry | undefined {
  return sessions.get(sessionId);
}

export function getAllSessions(): Map<string, SessionEntry> {
  return sessions;
}

export async function startSession(
  sessionId: string,
  orgId: string
): Promise<void> {
  if (sessions.has(sessionId)) {
    logger.warn({ sessionId }, 'Session already active, disconnecting first');
    await disconnectSession(sessionId);
  }

  const supabase = getSupabase();

  // Update status to connecting
  await supabase
    .from('wa_sessions')
    .update({ status: 'connecting', qr_code_data: null })
    .eq('id', sessionId);

  const { state, saveCreds } = await useSupabaseAuthState(sessionId);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger as any),
    },
    printQRInTerminal: true,
    logger: logger as any,
    browser: ['PelangganPro CRM', 'Chrome', '22.0'],
    generateHighQualityLinkPreview: false,
    syncFullHistory: true,
  });

  sessions.set(sessionId, { socket, orgId });

  // Handle connection updates
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, { width: 300 });
        await supabase
          .from('wa_sessions')
          .update({ status: 'qr_pending', qr_code_data: qrDataUrl })
          .eq('id', sessionId);
        logger.info({ sessionId }, 'QR code generated');
      } catch (err) {
        logger.error({ err, sessionId }, 'Failed to generate QR');
      }
    }

    if (connection === 'open') {
      const phoneNumber = socket.user?.id?.split(':')[0] || null;
      await supabase
        .from('wa_sessions')
        .update({
          status: 'connected',
          connected_at: new Date().toISOString(),
          phone_number: phoneNumber,
          qr_code_data: null,
        })
        .eq('id', sessionId);
      logger.info({ sessionId, phoneNumber }, 'WhatsApp connected');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      sessions.delete(sessionId);

      if (shouldReconnect) {
        logger.info({ sessionId, statusCode }, 'Reconnecting...');
        await startSession(sessionId, orgId);
      } else {
        // Logged out — clean up
        await supabase
          .from('wa_sessions')
          .update({
            status: 'disconnected',
            connected_at: null,
            phone_number: null,
            qr_code_data: null,
          })
          .eq('id', sessionId);
        // Clean auth state
        await supabase
          .from('wa_auth_states')
          .delete()
          .eq('session_id', sessionId);
        logger.info({ sessionId }, 'Logged out, session cleaned');
      }
    }
  });

  // Save credentials on update
  socket.ev.on('creds.update', saveCreds);

  // Handle incoming messages (real-time)
  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      await handleIncomingMessage(sessionId, orgId, msg);
    }
  });

  // Handle history sync — import existing chats on first connect
  socket.ev.on('messaging-history.set', async ({ chats, contacts, messages, isLatest }) => {
    logger.info(
      { sessionId, chats: chats.length, contacts: contacts.length, messages: messages.length, isLatest },
      'History sync received'
    );

    // Step 1: Build LID → phone/name mapping from contacts
    const lidMap = new Map<string, { phoneJid: string | null; name: string }>();
    for (const c of contacts) {
      const name = c.name || c.notify || '';
      // Map LID → phone + name
      if (c.lid) {
        lidMap.set(c.lid, { phoneJid: c.jid || null, name });
      }
      if (c.id?.endsWith('@lid')) {
        lidMap.set(c.id, { phoneJid: c.jid || null, name });
      }
      // Map phone JID → self (for direct lookups)
      if (c.jid) {
        lidMap.set(c.jid, { phoneJid: c.jid, name });
      }
      // Map by id if it's a phone JID
      if (c.id?.endsWith('@s.whatsapp.net')) {
        lidMap.set(c.id, { phoneJid: c.id, name });
      }
    }
    logger.info({ sessionId, contactMappings: lidMap.size }, 'Built LID→phone mapping');

    // Step 2: Upsert conversations — only groups + chats with a resolved name
    // Individual @lid chats without names will appear via real-time messages instead
    let importedChats = 0;
    for (const chat of chats) {
      const remoteJid = chat.id;
      if (!remoteJid || remoteJid === 'status@broadcast') continue;

      const isGroup = remoteJid.endsWith('@g.us');
      const contactInfo = lidMap.get(remoteJid);
      const hasResolvedName = !!(contactInfo?.name || chat.name);

      // Only import groups or chats where we have a real name/phone
      if (!isGroup && !hasResolvedName) continue;

      // Try to resolve LID to name/phone from contacts
      const remoteName = contactInfo?.name || chat.name || remoteJid.split('@')[0];
      const phoneNumber = contactInfo?.phoneJid
        ? contactInfo.phoneJid.split('@')[0]
        : (remoteJid.endsWith('@s.whatsapp.net') ? remoteJid.split('@')[0] : null);

      try {
        await supabase.from('wa_conversations').upsert(
          {
            org_id: orgId,
            session_id: sessionId,
            remote_jid: remoteJid,
            remote_name: remoteName,
            phone_number: phoneNumber,
            status: 'open',
            last_message_preview: '',
            last_message_at: chat.conversationTimestamp
              ? new Date(
                  typeof chat.conversationTimestamp === 'number'
                    ? chat.conversationTimestamp * 1000
                    : Number(chat.conversationTimestamp) * 1000
                ).toISOString()
              : new Date().toISOString(),
            unread_count: chat.unreadCount || 0,
            provider: 'bailey',
          },
          { onConflict: 'session_id,remote_jid' }
        );
        importedChats++;
      } catch (err) {
        logger.error({ err, remoteJid }, 'Failed to upsert history chat');
      }
    }
    logger.info({ sessionId, totalChats: chats.length, importedChats }, 'Filtered active chats');

    // Step 3: Import messages (with JID mismatch handling)
    for (const msg of messages) {
      if (!msg.message || !msg.key.remoteJid) continue;
      if (msg.key.remoteJid === 'status@broadcast') continue;

      const { body, type } = extractMessageContent(msg.message);
      const remoteJid = msg.key.remoteJid;
      const direction = msg.key.fromMe ? 'outbound' : 'inbound';

      try {
        // Get conversation ID — try direct match first
        let { data: conv } = await supabase
          .from('wa_conversations')
          .select('id')
          .eq('session_id', sessionId)
          .eq('remote_jid', remoteJid)
          .single();

        // If not found, try the alternate JID from contact map (LID ↔ phone)
        if (!conv) {
          const alt = lidMap.get(remoteJid);
          if (alt?.phoneJid && alt.phoneJid !== remoteJid) {
            const altResult = await supabase
              .from('wa_conversations')
              .select('id')
              .eq('session_id', sessionId)
              .eq('remote_jid', alt.phoneJid)
              .single();
            conv = altResult.data;
          }
          // Also try reverse: if message has phone JID, look for LID conversation
          if (!conv) {
            for (const [lid, info] of lidMap.entries()) {
              if (info.phoneJid === remoteJid && lid !== remoteJid) {
                const lidResult = await supabase
                  .from('wa_conversations')
                  .select('id')
                  .eq('session_id', sessionId)
                  .eq('remote_jid', lid)
                  .single();
                if (lidResult.data) {
                  conv = lidResult.data;
                  break;
                }
              }
            }
          }
        }

        if (!conv) continue;

        // Skip if message already imported
        if (msg.key.id) {
          const { data: existing } = await supabase
            .from('wa_messages')
            .select('id')
            .eq('wa_message_id', msg.key.id)
            .limit(1);
          if (existing && existing.length > 0) continue;
        }

        await supabase.from('wa_messages').insert({
          conversation_id: conv.id,
          wa_message_id: msg.key.id || null,
          direction,
          type,
          body: body || '',
          sender_name: msg.key.fromMe
            ? 'Anda'
            : msg.pushName || remoteJid.split('@')[0],
          status: 'delivered',
          raw_data: msg,
          created_at: msg.messageTimestamp
            ? new Date(
                typeof msg.messageTimestamp === 'number'
                  ? msg.messageTimestamp * 1000
                  : Number(msg.messageTimestamp) * 1000
              ).toISOString()
            : new Date().toISOString(),
        });
      } catch (err) {
        logger.error({ err, remoteJid: msg.key.remoteJid }, 'Failed to import history message');
      }
    }

    // Step 4: Update conversation previews from the last imported message
    for (const chat of chats) {
      if (!chat.id || chat.id === 'status@broadcast') continue;
      try {
        const { data: convRow } = await supabase
          .from('wa_conversations')
          .select('id')
          .eq('session_id', sessionId)
          .eq('remote_jid', chat.id)
          .single();

        if (!convRow) continue;

        const { data: lastMsg } = await supabase
          .from('wa_messages')
          .select('body, type, created_at')
          .eq('conversation_id', convRow.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastMsg) {
          await supabase
            .from('wa_conversations')
            .update({
              last_message_preview: lastMsg.body?.substring(0, 100) || `[${lastMsg.type}]`,
              last_message_at: lastMsg.created_at,
            })
            .eq('id', convRow.id);
        }
      } catch {
        // Skip preview update errors
      }
    }

    logger.info({ sessionId, chats: chats.length, messages: messages.length }, 'History sync processed');
  });

  // Handle contact discovery — resolve LID to name/phone on the fly
  socket.ev.on('contacts.upsert', async (contacts: Contact[]) => {
    for (const c of contacts) {
      const name = c.name || c.notify || '';
      const phoneJid = c.jid || (c.id?.endsWith('@s.whatsapp.net') ? c.id : null);
      const phoneNumber = phoneJid ? phoneJid.split('@')[0] : null;

      // Update conversations that match any of this contact's JIDs
      const jidsToMatch = [c.id, c.lid, c.jid].filter(Boolean) as string[];
      for (const jid of jidsToMatch) {
        const updates: Record<string, string> = {};
        if (name) updates.remote_name = name;
        if (phoneNumber) updates.phone_number = phoneNumber;
        if (Object.keys(updates).length === 0) continue;

        await supabase
          .from('wa_conversations')
          .update(updates)
          .eq('session_id', sessionId)
          .eq('remote_jid', jid);
      }
    }
  });

  // Handle message status updates (sent → delivered → read)
  socket.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
      if (!update.key.id) continue;
      const statusMap: Record<number, string> = {
        2: 'sent',
        3: 'delivered',
        4: 'read',
      };
      const newStatus = statusMap[update.update?.status as number];
      if (!newStatus) continue;

      await supabase
        .from('wa_messages')
        .update({ status: newStatus })
        .eq('wa_message_id', update.key.id);
    }
  });
}

async function handleIncomingMessage(
  sessionId: string,
  orgId: string,
  msg: any
): Promise<void> {
  const supabase = getSupabase();
  const remoteJid = msg.key.remoteJid!;
  // pushName is the contact's WhatsApp display name — prefer it over raw JID
  const remoteName = msg.pushName || remoteJid.split('@')[0];
  // Extract phone number from JID if it's a direct chat
  const phoneNumber = remoteJid.endsWith('@s.whatsapp.net')
    ? remoteJid.split('@')[0]
    : null;

  // Extract message content
  const { body, type } = extractMessageContent(msg.message);

  // Upsert conversation
  const { data: conv } = await supabase
    .from('wa_conversations')
    .upsert(
      {
        org_id: orgId,
        session_id: sessionId,
        remote_jid: remoteJid,
        remote_name: remoteName,
        phone_number: phoneNumber,
        status: 'open',
        last_message_preview: body?.substring(0, 100) || `[${type}]`,
        last_message_at: new Date().toISOString(),
        provider: 'bailey',
      },
      { onConflict: 'session_id,remote_jid' }
    )
    .select('id')
    .single();

  if (!conv) {
    logger.error({ remoteJid }, 'Failed to upsert conversation');
    return;
  }

  // Auto-link: if no contact_id and we have a phone number, search contacts table
  if (phoneNumber) {
    const { data: convRow } = await supabase
      .from('wa_conversations')
      .select('contact_id')
      .eq('id', conv.id)
      .single();

    if (convRow && !convRow.contact_id) {
      const { data: matchedContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('org_id', orgId)
        .or(`whatsapp.eq.${phoneNumber},phone.eq.${phoneNumber},whatsapp.eq.+${phoneNumber},phone.eq.+${phoneNumber}`)
        .limit(1)
        .maybeSingle();

      if (matchedContact) {
        await supabase
          .from('wa_conversations')
          .update({ contact_id: matchedContact.id })
          .eq('id', conv.id);
        logger.info({ sessionId, phoneNumber, contactId: matchedContact.id }, 'Auto-linked contact');
      }
    }
  }

  // Download and upload media if message contains media
  let mediaUrl: string | null = null;
  if (['image', 'document', 'video', 'audio'].includes(type) && msg.message) {
    try {
      const buffer = await downloadMediaMessage(msg, 'buffer', {}) as Buffer;
      const contentTypeKey = getContentType(msg.message);
      const mimeType = (msg.message as any)[contentTypeKey!]?.mimetype || 'application/octet-stream';
      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp',
        'application/pdf': 'pdf', 'video/mp4': 'mp4', 'audio/ogg; codecs=opus': 'ogg',
        'audio/mpeg': 'mp3',
      };
      const ext = extMap[mimeType] || 'bin';
      const filePath = `${orgId}/${conv.id}/${msg.key.id || crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('wa-media')
        .upload(filePath, buffer, { contentType: mimeType, upsert: false });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('wa-media')
          .getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
      } else {
        logger.warn({ uploadError, sessionId }, 'Failed to upload inbound media');
      }
    } catch (err) {
      logger.warn({ err, sessionId }, 'Failed to download inbound media');
    }
  }

  // Insert message
  await supabase.from('wa_messages').insert({
    conversation_id: conv.id,
    wa_message_id: msg.key.id,
    direction: 'inbound',
    type,
    body: body || '',
    media_url: mediaUrl,
    sender_name: remoteName,
    status: 'delivered',
    raw_data: msg,
  });

  // Increment unread
  await supabase.rpc('increment_unread', { conv_id: conv.id });

  logger.info({ sessionId, remoteJid, type, hasMedia: !!mediaUrl }, 'Inbound message processed');
}

function extractMessageContent(
  message: WAMessageContent | undefined | null
): { body: string | null; type: string } {
  if (!message) return { body: null, type: 'text' };

  const contentType = getContentType(message);

  switch (contentType) {
    case 'conversation':
      return { body: message.conversation || null, type: 'text' };
    case 'extendedTextMessage':
      return { body: message.extendedTextMessage?.text || null, type: 'text' };
    case 'imageMessage':
      return {
        body: message.imageMessage?.caption || null,
        type: 'image',
      };
    case 'documentMessage':
      return {
        body: message.documentMessage?.fileName || null,
        type: 'document',
      };
    case 'audioMessage':
      return { body: null, type: 'audio' };
    case 'videoMessage':
      return {
        body: message.videoMessage?.caption || null,
        type: 'video',
      };
    case 'stickerMessage':
      return { body: null, type: 'sticker' };
    case 'locationMessage':
      return { body: null, type: 'location' };
    case 'contactMessage':
      return { body: null, type: 'contact' };
    default:
      return { body: null, type: 'text' };
  }
}

export async function sendMessage(
  sessionId: string,
  conversationId: string,
  remoteJid: string,
  body: string,
  senderId: string | null,
  senderName: string | null,
  mediaUrl?: string | null,
  mediaType?: string | null,
  fileName?: string | null,
  mimeType?: string | null,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const session = sessions.get(sessionId);
  if (!session) return { success: false, error: 'Session not active' };

  const supabase = getSupabase();
  const msgType = mediaType || 'text';

  // Insert message as pending
  const { data: msgRow } = await supabase
    .from('wa_messages')
    .insert({
      conversation_id: conversationId,
      direction: 'outbound',
      type: msgType,
      body,
      media_url: mediaUrl || null,
      status: 'pending',
      sender_id: senderId,
      sender_name: senderName,
    })
    .select('id')
    .single();

  try {
    let sent;

    if (mediaUrl && mediaType === 'image') {
      // Download image from Supabase Storage URL
      const response = await fetch(mediaUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      sent = await session.socket.sendMessage(remoteJid, {
        image: buffer,
        caption: body || undefined,
        mimetype: (mimeType || 'image/jpeg') as any,
      });
    } else if (mediaUrl && mediaType === 'document') {
      // Download document from Supabase Storage URL
      const response = await fetch(mediaUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      sent = await session.socket.sendMessage(remoteJid, {
        document: buffer,
        fileName: fileName || 'file',
        mimetype: (mimeType || 'application/octet-stream') as any,
        caption: body || undefined,
      });
    } else {
      // Text-only message
      sent = await session.socket.sendMessage(remoteJid, { text: body });
    }

    // Update with WA message ID and status
    if (msgRow) {
      await supabase
        .from('wa_messages')
        .update({
          wa_message_id: sent?.key?.id || null,
          status: 'sent',
        })
        .eq('id', msgRow.id);
    }

    // Update conversation preview
    const preview = mediaType
      ? (body ? body.substring(0, 100) : `[${mediaType === 'image' ? 'Gambar' : 'Dokumen'}]`)
      : body.substring(0, 100);

    await supabase
      .from('wa_conversations')
      .update({
        last_message_preview: preview,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      })
      .eq('id', conversationId);

    return { success: true, messageId: msgRow?.id };
  } catch (err: any) {
    if (msgRow) {
      await supabase
        .from('wa_messages')
        .update({ status: 'failed' })
        .eq('id', msgRow.id);
    }
    logger.error({ err, sessionId, conversationId }, 'Failed to send message');
    return { success: false, error: err.message };
  }
}

export async function disconnectSession(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId);
  if (session) {
    try {
      await session.socket.logout();
    } catch {
      session.socket.end(undefined);
    }
    sessions.delete(sessionId);
  }

  const supabase = getSupabase();
  await supabase
    .from('wa_sessions')
    .update({
      status: 'disconnected',
      connected_at: null,
      phone_number: null,
      qr_code_data: null,
    })
    .eq('id', sessionId);

  // Clean auth state
  await supabase
    .from('wa_auth_states')
    .delete()
    .eq('session_id', sessionId);

  logger.info({ sessionId }, 'Session disconnected and cleaned');
}

export async function restoreActiveSessions(): Promise<void> {
  const supabase = getSupabase();
  const { data: activeSessions } = await supabase
    .from('wa_sessions')
    .select('id, org_id')
    .eq('status', 'connected');

  if (!activeSessions?.length) {
    logger.info('No active sessions to restore');
    return;
  }

  logger.info({ count: activeSessions.length }, 'Restoring active sessions');
  for (const s of activeSessions) {
    try {
      await startSession(s.id, s.org_id);
    } catch (err) {
      logger.error({ err, sessionId: s.id }, 'Failed to restore session');
    }
  }
}
