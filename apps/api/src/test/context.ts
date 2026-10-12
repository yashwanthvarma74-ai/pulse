import { randomBytes } from 'node:crypto';
import { pino } from 'pino';
import supertest from 'supertest';
import { createApp } from '../app';
import { loadConfig } from '../config';
import { connect, ensureIndexes, type Database } from '../db';

const MONGO_URL = process.env.MONGODB_TEST_URL ?? 'mongodb://127.0.0.1:27017';

export interface TestContext {
  database: Database;
  /** A client that keeps cookies between requests, like a browser. */
  agent: () => ReturnType<typeof supertest.agent>;
  /** A client signed in as a fresh guest. */
  signedInAgent: () => Promise<ReturnType<typeof supertest.agent>>;
  close: () => Promise<void>;
}

// Each test file gets its own database on the local MongoDB server and drops it afterwards.
export async function createTestContext(): Promise<TestContext> {
  const dbName = `pulse_test_${randomBytes(6).toString('hex')}`;
  const database = await connect(`${MONGO_URL}/${dbName}`);
  await ensureIndexes(database);

  const config = loadConfig({ NODE_ENV: 'test' });
  const app = createApp(database, config, pino({ level: 'silent' }));
  const agent = () => supertest.agent(app);

  return {
    database,
    agent,
    signedInAgent: async () => {
      const client = agent();
      await client.post('/auth/guest').expect(201);
      return client;
    },
    close: async () => {
      await database.db.dropDatabase();
      await database.client.close();
    },
  };
}
