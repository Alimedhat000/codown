import { Hocuspocus } from '@hocuspocus/server';
import jwt from 'jsonwebtoken';

import { dbPersistence } from '@/lib/dbPersistence';
import { logger } from '@/lib/logger';
import { getDocumentPermission } from '@/utils/getDocumentPermission';

const server = new Hocuspocus({
  // port: 5002,
  quiet: true,
  extensions: [
    dbPersistence,
    {
      onConnect: async data => {
        logger.debug('WebSocket connected', {
          action: 'WS_CONNECT',
          documentName: data.documentName,
        });
      },
      onAuthenticate: async ({ token, documentName, connectionConfig }) => {
        if (!token) {
          throw new Error('Missing token');
        }

        let userId: string;
        try {
          const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
          if (typeof payload === 'string' || !payload.userId) {
            throw new Error('Invalid token payload');
          }
          userId = payload.userId;
        } catch {
          throw new Error('Invalid or expired token');
        }

        const permission = await getDocumentPermission(userId, documentName);
        if (!permission) {
          throw new Error('Access denied');
        }

        connectionConfig.readOnly = permission === 'view';
      },
      onLoadDocument: async (data: { documentName: string }) => {
        logger.debug('WebSocket document loaded', {
          action: 'WS_LOAD',
          documentName: data.documentName,
        });
      },
      onDisconnect: async (data: { documentName: string }) => {
        logger.debug('WebSocket closed', {
          action: 'WS_CLOSE',
          documentName: data.documentName,
        });
      },
    },
  ],
});

export default server;
