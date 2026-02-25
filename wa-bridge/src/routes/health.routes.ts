import { Router } from 'express';
import { getAllSessions } from '../services/baileys.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    activeSessions: getAllSessions().size,
    uptime: process.uptime(),
  });
});

export default router;
