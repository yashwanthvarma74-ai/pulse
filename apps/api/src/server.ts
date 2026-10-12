import { pino } from 'pino';
import { createApp } from './app';
import { loadConfig } from './config';
import { connect, ensureIndexes } from './db';

const config = loadConfig();
const logger = pino({ level: config.LOG_LEVEL });

const database = await connect(config.MONGODB_URI);
await ensureIndexes(database);

const server = createApp(database, config, logger).listen(config.API_PORT, () => {
  logger.info(`API listening on port ${config.API_PORT}`);
});

async function shutdown() {
  server.close();
  await database.client.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
