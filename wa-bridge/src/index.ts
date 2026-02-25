import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, logger } from './config';
import { authMiddleware } from './middleware/auth.middleware';
import { restoreActiveSessions } from './services/baileys.service';
import healthRoutes from './routes/health.routes';
import sessionRoutes from './routes/session.routes';
import messageRoutes from './routes/message.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check — no auth required
app.use(healthRoutes);

// All /api routes require bridge secret
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);

app.listen(config.port, async () => {
  logger.info({ port: config.port }, 'WA Bridge server started');

  // Restore previously connected sessions
  try {
    await restoreActiveSessions();
  } catch (err) {
    logger.error({ err }, 'Failed to restore sessions on startup');
  }
});
