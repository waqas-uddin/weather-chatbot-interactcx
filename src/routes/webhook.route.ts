import { Router } from 'express';
import { handleWebhook } from '../controllers/webhook.controller';
import { validateWebhookSecret } from '../middleware/validateWebhookSecret';

export const webhookRouter = Router();

webhookRouter.post('/', validateWebhookSecret, handleWebhook);
