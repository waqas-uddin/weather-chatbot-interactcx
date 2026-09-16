import { Router } from 'express';
import { webhookRouter } from './webhook.route';

export const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

router.use('/webhook', webhookRouter);
