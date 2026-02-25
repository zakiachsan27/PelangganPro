import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers['x-bridge-secret'] as string;
  if (!config.bridgeSecret || secret !== config.bridgeSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
