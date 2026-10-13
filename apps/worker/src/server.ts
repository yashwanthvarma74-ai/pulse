import { pino } from 'pino';
import { createCore, loadConfig, startMetrics, startWorkers } from '@pulse/core';

const config = loadConfig();
const logger = pino({ level: config.LOG_LEVEL });
const stopMetrics = startMetrics('pulse-worker', Number(process.env.WORKER_METRICS_PORT ?? 9465));

const core = await createCore(config, { logger });
const stopWorkers = startWorkers(core);
logger.info('Workers running: events, media, moderation');

async function shutdown() {
  await stopWorkers();
  await core.close();
  await stopMetrics();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
