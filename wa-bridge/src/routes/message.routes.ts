import { Router } from 'express';
import { sendMessage, getSession } from '../services/baileys.service';
import { logger } from '../config';

const router = Router();

// POST /api/messages/send
router.post('/send', async (req, res) => {
  const {
    sessionId, conversationId, remoteJid, body, senderId, senderName,
    mediaUrl, mediaType, fileName, mimeType,
  } = req.body;

  if (!sessionId || !conversationId || !remoteJid || (!body && !mediaUrl)) {
    res.status(400).json({
      error: 'sessionId, conversationId, remoteJid, and (body or mediaUrl) are required',
    });
    return;
  }

  const session = getSession(sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not active' });
    return;
  }

  try {
    const result = await sendMessage(
      sessionId,
      conversationId,
      remoteJid,
      body || '',
      senderId || null,
      senderName || null,
      mediaUrl || null,
      mediaType || null,
      fileName || null,
      mimeType || null,
    );
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err: any) {
    logger.error({ err }, 'Failed to send message');
    res.status(500).json({ error: err.message });
  }
});

export default router;
