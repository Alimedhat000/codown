import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { verifyShareToken } from '@/lib/shareToken';
import { app } from '@/server'; // your express app

function extractCookies(rawCookies: string[] | string | undefined): string {
  if (!rawCookies) return '';
  const cookiesArray = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
  return cookiesArray.map(entry => entry.split(';')[0]).join('; ');
}

let token: string;
let userId: string;
// eslint-disable-next-line
let cookie: string;

beforeEach(async () => {
  // Clear database
  await prisma.collaborator.deleteMany();
  await prisma.collaborationRequest.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Register and login user
  await request(app).post('/api/auth/register').send({
    email: 'docuser@test.dev',
    username: 'docuser',
    password: 'secure123',
  });

  const login = await request(app).post('/api/auth/login').send({
    email: 'docuser@test.dev',
    password: 'secure123',
  });

  token = login.body.accessToken;
  cookie = extractCookies(login.headers['set-cookie']);
  userId = login.body.user.id;
});

describe('Document Routes', () => {
  // eslint-disable-next-line
  let docId: string;

  it('should create a document', async () => {
    const res = await request(app)
      .post('/api/document')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Doc', content: 'Initial content', isPublic: true });

    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body.title).toBe('My Doc');
    docId = res.body.id;
  });

  it('should fetch documents for a user', async () => {
    await prisma.document.create({
      data: {
        title: 'Test Doc',
        content: 'Some content',
        authorId: userId,
      },
    });

    const res = await request(app).get('/api/document').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.owned).toHaveLength(1);
    expect(res.body.collaborated).toHaveLength(0);
  });

  it('should get a specific document', async () => {
    const created = await prisma.document.create({
      data: { title: 'Single Doc', content: 'data', authorId: userId },
    });

    const res = await request(app).get(`/api/document/${created.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.title).toBe('Single Doc');
  });

  it('should update a document', async () => {
    const created = await prisma.document.create({
      data: { title: 'Updatable', content: 'Before', authorId: userId },
    });

    const res = await request(app)
      .put(`/api/document/${created.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title', content: 'After', isPublic: true });

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.title).toBe('Updated Title');
  });

  it('should delete a document', async () => {
    const created = await prisma.document.create({
      data: {
        title: 'ToDelete',
        authorId: userId,
        content: '',
      },
    });

    const res = await request(app).delete(`/api/document/${created.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(StatusCodes.NO_CONTENT);
  });

  it('should update document settings (allowSelfJoin)', async () => {
    const created = await prisma.document.create({
      data: {
        title: 'Settings',
        authorId: userId,
        content: '',
      },
    });

    const res = await request(app)
      .patch(`/api/document/${created.id}/settings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ allowSelfJoin: true });

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.updated.allowSelfJoin).toBe(true);
  });

  it('should handle collaborator requests via share ID', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Shareable',
        authorId: userId,
        allowSelfJoin: true,
        shareId: 'share123',
        content: '',
      },
    });

    const shareUrl = await request(app)
      .get(`/api/document/${doc.id}/share-link?permission=view`)
      .set('Authorization', `Bearer ${token}`);
    //Parse the token out from the URL
    const parsed = new URL(shareUrl.body.url);
    const shareToken = parsed.pathname.split('/').pop();

    expect(shareToken).toBeDefined();

    const decoded = verifyShareToken(shareToken!);
    expect(decoded.shareId).toBe('share123');
    expect(decoded.permission).toBe('view');

    // Simulate collaborator opening the share link
    const res2 = await request(app)
      .get(`/api/document/share/${shareToken}`) // Token is now in the path
      .set('Authorization', `Bearer ${token}`); // test user's token

    expect([StatusCodes.OK, StatusCodes.ACCEPTED]).toContain(res2.status);
  });

  it('should reject request with invalid token', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Shareable',
        authorId: userId,
        allowSelfJoin: true,
        shareId: 'share999',
        content: '',
      },
    });

    const res = await request(app)
      .get(`/api/document/share/${doc.shareId}?token=invalidtoken`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should fetch and approve collaboration requests', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Requestable',
        authorId: userId,
        allowSelfJoin: false,
        shareId: 'share-req',
        content: '',
      },
    });

    // Simulate user joining with new account
    const user2 = await prisma.user.create({
      data: {
        email: 'collab2@test.dev',
        username: 'collab2',
        password: 'hashedpw',
      },
    });

    await prisma.collaborationRequest.create({
      data: { userId: user2.id, documentId: doc.id },
    });

    const res = await request(app).get(`/api/document/${doc.id}/requests`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const reqId = res.body[0].id;

    const approve = await request(app)
      .post(`/api/document/${doc.id}/requests/${reqId}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(approve.status).toBe(StatusCodes.OK);
  });

  it('should add and remove collaborators', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Collab Test',
        authorId: userId,
        content: '',
      },
    });

    const newUser = await prisma.user.create({
      data: {
        email: 'collabuser@test.dev',
        username: 'collabuser',
        password: 'hashedpass',
      },
    });

    const addRes = await request(app)
      .post(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newUser.email, permission: 'edit' });

    expect(addRes.status).toBe(StatusCodes.OK);
    expect(addRes.body.userId).toBe(newUser.id);
    expect(addRes.body.permission).toBe('edit');

    const collaboratorId = addRes.body.id;

    const removeRes = await request(app)
      .delete(`/api/document/${doc.id}/collaborators/${collaboratorId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removeRes.status).toBe(StatusCodes.OK);
  });

  it('should add a collaborator by email with default edit permission', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Default Permission', authorId: userId, content: '' },
    });

    const newUser = await prisma.user.create({
      data: {
        email: 'defaultperm@test.dev',
        username: 'defaultperm',
        password: 'hashedpass',
      },
    });

    const res = await request(app)
      .post(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newUser.email });

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.userId).toBe(newUser.id);
    expect(res.body.permission).toBe('edit');
  });

  it('should add a collaborator by email regardless of case', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Case Insensitive', authorId: userId, content: '' },
    });

    const newUser = await prisma.user.create({
      data: {
        email: 'caseinsensitive@test.dev',
        username: 'caseinsensitive',
        password: 'hashedpass',
      },
    });

    const res = await request(app)
      .post(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'CaseInsensitive@Test.DEV' });

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.userId).toBe(newUser.id);
  });

  it('should return 404 when adding a collaborator with an unknown email', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Unknown Email', authorId: userId, content: '' },
    });

    const res = await request(app)
      .post(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'nobody@test.dev' });

    expect(res.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return 409 when adding an existing collaborator', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Duplicate Collab', authorId: userId, content: '' },
    });

    const newUser = await prisma.user.create({
      data: {
        email: 'dupcollab@test.dev',
        username: 'dupcollab',
        password: 'hashedpass',
      },
    });

    const first = await request(app)
      .post(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newUser.email });

    expect(first.status).toBe(StatusCodes.OK);

    const second = await request(app)
      .post(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newUser.email });

    expect(second.status).toBe(StatusCodes.CONFLICT);
  });

  it('should return 400 when adding a collaborator with an invalid body', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Invalid Body', authorId: userId, content: '' },
    });

    const res = await request(app)
      .post(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should return 409 when a concurrent duplicate insert loses the race (P2002)', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Race Collab', authorId: userId, content: '' },
    });

    const newUser = await prisma.user.create({
      data: {
        email: 'racecollab@test.dev',
        username: 'racecollab',
        password: 'hashedpass',
      },
    });

    // Simulate the losing insert of two concurrent adds that both passed the
    // pre-check: the unique constraint on (documentId, userId) rejects it.
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`documentId`,`userId`)',
      { code: 'P2002', clientVersion: '6.12.0' }
    );
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const originalFindUnique = prisma.collaborator.findUnique;
    const originalCreate = prisma.collaborator.create;
    (prisma.collaborator as any).findUnique = async () => null;
    (prisma.collaborator as any).create = async () => {
      throw p2002;
    };

    try {
      const res = await request(app)
        .post(`/api/document/${doc.id}/collaborators`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: newUser.email });

      expect(res.status).toBe(StatusCodes.CONFLICT);
    } finally {
      (prisma.collaborator as any).findUnique = originalFindUnique;
      (prisma.collaborator as any).create = originalCreate;
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }
  });

  it('should forbid non-owners from listing collaborators', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Private Doc', authorId: userId, content: '' },
    });

    await request(app).post('/api/auth/register').send({
      email: 'outsider@test.dev',
      username: 'outsider',
      password: 'secure123',
    });

    const outsiderLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'outsider@test.dev', password: 'secure123' });

    const res = await request(app)
      .get(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${outsiderLogin.body.accessToken}`);

    expect(res.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('should not expose credentials when listing collaborators', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Leaky', authorId: userId, content: '' },
    });

    const collaboratorUser = await prisma.user.create({
      data: {
        email: 'leakcollab@test.dev',
        username: 'leakcollab',
        password: 'super-hashed-secret',
        fullName: 'Leaky Collaborator',
        refreshToken: 'stale-refresh-token-value',
      },
    });

    await prisma.collaborator.create({
      data: { documentId: doc.id, userId: collaboratorUser.id, permission: 'edit' },
    });

    const res = await request(app).get(`/api/document/${doc.id}/collaborators`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toHaveLength(1);
    for (const collaborator of res.body) {
      expect(Object.keys(collaborator.user).sort()).toEqual(['fullName', 'id', 'username']);
    }
    expect(JSON.stringify(res.body)).not.toContain('super-hashed-secret');
    expect(JSON.stringify(res.body)).not.toContain('stale-refresh-token-value');
    expect(JSON.stringify(res.body)).not.toContain('leakcollab@test.dev');
  });

  it('should allow edit collaborators to list collaborators', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Shared Doc', authorId: userId, content: '' },
    });

    await request(app).post('/api/auth/register').send({
      email: 'editor@test.dev',
      username: 'editor',
      password: 'secure123',
    });

    const editorLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'editor@test.dev', password: 'secure123' });
    const editorId = editorLogin.body.user.id;

    await prisma.collaborator.create({
      data: { documentId: doc.id, userId: editorId, permission: 'edit' },
    });

    const res = await request(app)
      .get(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${editorLogin.body.accessToken}`);

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toHaveLength(1);
    expect(Object.keys(res.body[0].user).sort()).toEqual(['fullName', 'id', 'username']);
  });

  it('should forbid view-only collaborators from listing collaborators', async () => {
    const doc = await prisma.document.create({
      data: { title: 'Viewer Doc', authorId: userId, content: '' },
    });

    await request(app).post('/api/auth/register').send({
      email: 'viewer@test.dev',
      username: 'viewer',
      password: 'secure123',
    });

    const viewerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@test.dev', password: 'secure123' });
    const viewerId = viewerLogin.body.user.id;

    await prisma.collaborator.create({
      data: { documentId: doc.id, userId: viewerId, permission: 'view' },
    });

    const res = await request(app)
      .get(`/api/document/${doc.id}/collaborators`)
      .set('Authorization', `Bearer ${viewerLogin.body.accessToken}`);

    expect(res.status).toBe(StatusCodes.FORBIDDEN);
  });
});
