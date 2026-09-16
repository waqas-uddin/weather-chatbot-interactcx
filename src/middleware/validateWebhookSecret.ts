import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

const HEADER_NAME = 'x-webhook-secret';

export function validateWebhookSecret(req: Request, res: Response, next: NextFunction): void {
  if (!env.WEBHOOK_SECRET) {
    next();
    return;
  }

  const provided = req.header(HEADER_NAME);
  if (provided !== env.WEBHOOK_SECRET) {
    res.status(401).json({ fulfillmentText: 'Unauthorized webhook request.' });
    return;
  }

  next();
}
