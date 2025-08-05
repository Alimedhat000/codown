// lib/shareToken.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SHARE_LINK_SECRET || 'super-secret';

export function generateShareToken(shareId: string, permission: 'view' | 'edit') {
  return jwt.sign({ shareId, permission }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyShareToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { shareId: string; permission: 'view' | 'edit' };
}
