import { Hocuspocus } from '@hocuspocus/server';

import { dbPersistence } from '@/lib/dbPersistence';
import { logger } from '@/lib/logger';

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
