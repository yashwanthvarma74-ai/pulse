import { pino } from 'pino';
import { createCore, loadConfig, startMetrics } from '@pulse/core';
import { createApp } from './app';
import { attachGateway } from './gateway';

const config = loadConfig();
const logger = pino({ level: config.LOG_LEVEL });
const stopMetrics = startMetrics('pulse-api', Number(process.env.API_METRICS_PORT ?? 9464));

const core = await createCore(config, { logger });
const server = createApp(core, logger).listen(config.API_PORT, () => {
  logger.info(`API listening on port ${config.API_PORT}`);
});
const closeGateway = attachGateway(server, core, logger);

async function shutdown() {
  server.close();
  await closeGateway();
  await core.close();
  await stopMetrics();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
