// lib/shareToken.ts
import jwt from 'jsonwebtoken';

import { env } from '@/config/env.config';

const JWT_SECRET = env.SHARE_LINK_SECRET;

export function generateShareToken(shareId: string, permission: 'view' | 'edit') {
  return jwt.sign({ shareId, permission }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyShareToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { shareId: string; permission: 'view' | 'edit' };
}
