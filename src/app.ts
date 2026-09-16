import express, { Express } from 'express';
import { router } from './routes';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);

  app.use('/', router);

  app.use(errorHandler);

  return app;
}
