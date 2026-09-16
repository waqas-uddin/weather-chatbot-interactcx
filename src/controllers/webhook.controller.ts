import { NextFunction, Request, Response } from 'express';
import { WebhookRequest } from '../dialogflow/types';
import { intentHandlers } from '../dialogflow/intents';
import { buildTextResponse } from '../dialogflow/responseBuilder';
import { UnknownIntentError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as WebhookRequest;
    const intentName = body?.queryResult?.intent?.displayName;
    const parameters = body?.queryResult?.parameters ?? {};

    logger.info({ intentName, parameters, query: body?.queryResult?.queryText }, 'Received webhook request');

    const handler = intentHandlers[intentName];
    if (!handler) {
      throw new UnknownIntentError(intentName ?? 'undefined');
    }

    const fulfillmentText = await handler(parameters);
    res.status(200).json(buildTextResponse(fulfillmentText));
  } catch (err) {
    next(err);
  }
}
