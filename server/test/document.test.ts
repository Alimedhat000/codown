import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
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
    const shareId = parsed.pathname.split('/').pop(); // 'share123'
    const shareToken = parsed.searchParams.get('token'); // actual JWT token

    expect(shareId).toBe('share123');
    expect(shareToken).toBeDefined();

    // Simulate collaborator opening the share link
    const res2 = await request(app)
      .get(`/api/document/share/${shareId}?token=${shareToken}`)
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
      .send({ userId: newUser.id, permission: 'edit' });

    expect(addRes.status).toBe(StatusCodes.OK);

    const collaboratorId = addRes.body.id;

    const removeRes = await request(app)
      .delete(`/api/document/${doc.id}/collaborators/${collaboratorId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(removeRes.status).toBe(StatusCodes.OK);
  });
});
