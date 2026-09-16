import { NextFunction, Request, Response } from 'express';
import { isAppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { buildTextResponse } from '../dialogflow/responseBuilder';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (isAppError(err)) {
    logger.warn({ err: err.message, path: req.path }, 'Handled application error');
    res.status(200).json(buildTextResponse(err.userMessage));
    return;
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  logger.error({ err: message, stack: err instanceof Error ? err.stack : undefined, path: req.path }, 'Unhandled error');
  res
    .status(200)
    .json(buildTextResponse('Sorry, something went wrong on my end. Please try again shortly.'));
}
