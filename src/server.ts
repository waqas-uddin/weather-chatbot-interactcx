import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Weather Chatbot webhook listening on port ${env.PORT} (${env.NODE_ENV})`);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught exception - exiting');
  process.exit(1);
});
