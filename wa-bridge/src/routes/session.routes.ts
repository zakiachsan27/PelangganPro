import { Router } from 'express';
import {
  startSession,
  disconnectSession,
  getSession,
} from '../services/baileys.service';
import { logger } from '../config';

const router = Router();

// POST /api/sessions/start — Start or reconnect a WA session
router.post('/start', async (req, res) => {
  const { sessionId, orgId } = req.body;
  if (!sessionId || !orgId) {
    res.status(400).json({ error: 'sessionId and orgId required' });
    return;
  }

  try {
    await startSession(sessionId, orgId);
    res.json({ success: true, message: 'Session starting' });
  } catch (err: any) {
    logger.error({ err, sessionId }, 'Failed to start session');
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sessions/:id — Disconnect and clean up
router.delete('/:id', async (req, res) => {
  try {
    await disconnectSession(req.params.id);
    res.json({ success: true, message: 'Session disconnected' });
  } catch (err: any) {
    logger.error({ err, sessionId: req.params.id }, 'Failed to disconnect');
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:id/status — Get session connection status
router.get('/:id/status', (req, res) => {
  const session = getSession(req.params.id);
  res.json({
    active: !!session,
    sessionId: req.params.id,
  });
});

export default router;
