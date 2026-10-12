import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { pino } from 'pino';
import supertest from 'supertest';
import { createTestCore, type TestCore } from '@pulse/core/test';
import { createApp } from '../app';
import { attachGateway } from '../gateway';

export type Agent = ReturnType<typeof supertest.agent>;

export interface ApiContext {
  core: TestCore;
  agent: () => Agent;
  // a browser-like client signed in as a fresh guest
  guest: () => Promise<{ agent: Agent; id: string; handle: string }>;
  // a client signed in as an existing user (the session cookie is made the way the API makes it)
  asUser: (
    handle: string,
    fields?: Record<string, unknown>,
  ) => Promise<{ agent: Agent; id: string }>;
  listen: () => Promise<{ server: Server; port: number; close: () => Promise<void> }>;
  close: () => Promise<void>;
}

export async function createApiContext(
  overrides: Record<string, string> = {},
): Promise<ApiContext> {
  const core = await createTestCore({ DEMO_LOGIN: 'true', ...overrides });
  const logger = pino({ level: 'silent' });
  const app = createApp(core, logger);
  const agent = () => supertest.agent(app);

  return {
    core,
    agent,
    guest: async () => {
      const client = agent();
      const res = await client.post('/auth/guest').expect(201);
      return { agent: client, id: res.body.user.id, handle: res.body.user.handle };
    },
    asUser: async (handle, fields = {}) => {
      const user = await core.user(handle, fields);
      await core.database.users.updateOne(
        { _id: user._id },
        { $set: { demoRole: 'Test account' } },
      );
      const client = agent();
      await client.post('/auth/demo').send({ handle }).expect(200);
      return { agent: client, id: user._id.toHexString() };
    },
    listen: async () => {
      const server = createServer(app);
      const closeGateway = attachGateway(server, core, logger);
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      return {
        server,
        port: (server.address() as AddressInfo).port,
        close: async () => {
          await closeGateway();
          await new Promise((resolve) => server.close(resolve));
        },
      };
    },
    close: () => core.destroy(),
  };
}
