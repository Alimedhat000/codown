import { AddressInfo } from 'node:net';

import { HocuspocusProvider } from '@hocuspocus/provider';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';

import { prisma } from '@/lib/prisma';
import { app } from '@/server';
import socketServer from '@/sockets/ws-server';

const TOKEN_TIMEOUT_MS = 5_000;
const TEST_TIMEOUT_MS = 20_000;

let wss: WebSocketServer;
let port: number;
const providers: HocuspocusProvider[] = [];

beforeAll(async () => {
  wss = new WebSocketServer({ port: 0 });
  wss.on('connection', (ws, req) => socketServer.handleConnection(ws, req));
  await new Promise<void>(resolve => wss.once('listening', resolve));
  port = (wss.address() as AddressInfo).port;
});

afterAll(async () => {
  for (const ws of wss.clients) ws.terminate();
  await new Promise<void>(resolve => wss.close(() => resolve()));
});

afterEach(async () => {
  for (const p of providers.splice(0)) await p.destroy();
});

describe('WebSocket authentication', () => {
  let ownerToken: string;
  let docId: string;

  beforeEach(async () => {
    await prisma.collaborator.deleteMany();
    await prisma.collaborationRequest.deleteMany();
    await prisma.yjsDocumentState.deleteMany();
    await prisma.document.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post('/api/auth/register').send({
      email: 'wsowner@test.dev',
      username: 'wsowner',
      password: 'secure123',
    });

    const login = await request(app).post('/api/auth/login').send({
      email: 'wsowner@test.dev',
      password: 'secure123',
    });
    ownerToken = login.body.accessToken;

    const doc = await prisma.document.create({
      data: { title: 'WS Doc', content: '', authorId: login.body.user.id },
    });
    docId = doc.id;
  });

  function connect(token: string | null): HocuspocusProvider {
    // Node >=21 provides a global WebSocket, which the provider falls back to
    const provider = new HocuspocusProvider({
      url: `ws://127.0.0.1:${port}/collaboration`,
      name: docId,
      document: new Y.Doc(),
      token,
    });
    providers.push(provider);
    return provider;
  }

  it(
    'rejects a connection with an invalid token',
    async () => {
      const provider = connect('not-a-real-jwt');

      let failed = false;
      let synced = false;
      provider.on('authenticationFailed', () => {
        failed = true;
      });
      provider.on('synced', () => {
        synced = true;
      });

      await expect.poll(() => failed, { timeout: TOKEN_TIMEOUT_MS }).toBe(true);
      expect(synced).toBe(false);
    },
    TEST_TIMEOUT_MS
  );

  it(
    'accepts the document owner and syncs',
    async () => {
      const provider = connect(ownerToken);

      let synced = false;
      provider.on('synced', () => {
        synced = true;
      });

      await expect.poll(() => synced, { timeout: TOKEN_TIMEOUT_MS }).toBe(true);
    },
    TEST_TIMEOUT_MS
  );

  async function createCollaborator(permission: 'view' | 'edit') {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: `wscollab-${permission}@test.dev`,
        username: `wscollab_${permission}`,
        password: 'secure123',
      });
    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: `wscollab-${permission}@test.dev`,
        password: 'secure123',
      });

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: `wscollab-${permission}@test.dev` },
    });
    await prisma.collaborator.create({
      data: { documentId: docId, userId: user.id, permission },
    });

    return login.body.accessToken as string;
  }

  it(
    'accepts a view collaborator but drops their writes',
    async () => {
      const viewToken = await createCollaborator('view');
      const provider = connect(viewToken);

      let synced = false;
      provider.on('synced', () => {
        synced = true;
      });
      await expect.poll(() => synced, { timeout: TOKEN_TIMEOUT_MS }).toBe(true);

      const intruder = `sneaky edit ${Date.now()}`;
      provider.document.getText('content').insert(0, intruder);

      // Give any (forbidden) sync a fair chance to propagate before tearing down
      await new Promise(resolve => setTimeout(resolve, 1_500));
      await provider.destroy();
      await new Promise(resolve => setTimeout(resolve, 1_500));

      const doc = await prisma.document.findUniqueOrThrow({ where: { id: docId } });
      expect(doc.content).not.toContain(intruder);
    },
    TEST_TIMEOUT_MS
  );

  it(
    'accepts an edit collaborator and persists their writes',
    async () => {
      const editToken = await createCollaborator('edit');
      const provider = connect(editToken);

      let synced = false;
      provider.on('synced', () => {
        synced = true;
      });
      await expect.poll(() => synced, { timeout: TOKEN_TIMEOUT_MS }).toBe(true);

      const text = `collaborative edit ${Date.now()}`;
      provider.document.getText('content').insert(0, text);

      // Round-trip: the server echoes the merged state back
      await expect
        .poll(() => provider.document.getText('content').toString(), {
          timeout: TOKEN_TIMEOUT_MS,
        })
        .toContain(text);

      await provider.destroy();

      await expect
        .poll(
          async () => {
            const doc = await prisma.document.findUnique({ where: { id: docId } });
            return doc?.content ?? '';
          },
          { timeout: TOKEN_TIMEOUT_MS }
        )
        .toContain(text);
    },
    TEST_TIMEOUT_MS
  );

  it(
    'denies a stranger access to a private document',
    async () => {
      await request(app).post('/api/auth/register').send({
        email: 'wsstranger@test.dev',
        username: 'wsstranger',
        password: 'secure123',
      });
      const strangerLogin = await request(app).post('/api/auth/login').send({
        email: 'wsstranger@test.dev',
        password: 'secure123',
      });

      const provider = connect(strangerLogin.body.accessToken);

      let failed = false;
      let synced = false;
      provider.on('authenticationFailed', () => {
        failed = true;
      });
      provider.on('synced', () => {
        synced = true;
      });

      await expect.poll(() => failed, { timeout: TOKEN_TIMEOUT_MS }).toBe(true);
      expect(synced).toBe(false);
    },
    TEST_TIMEOUT_MS
  );
});
