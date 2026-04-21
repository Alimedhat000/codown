import { Hocuspocus } from '@hocuspocus/server';

import { logger } from '@/lib/logger';
import { dbPersistence } from '@/lib/dbPersistence';

const server = new Hocuspocus({
  // port: 5002,
  quiet: true,
  extensions: [
    dbPersistence,
    {
      onConnect: (data) => {
        logger.debug('WebSocket connected', {
          action: 'WS_CONNECT',
          documentName: data.documentName,
        });
      },
      onLoad: (data) => {
        logger.debug('WebSocket document loaded', {
          action: 'WS_LOAD',
          documentName: data.documentName,
        });
      },
      onClose: (data) => {
        logger.debug('WebSocket closed', {
          action: 'WS_CLOSE',
          documentName: data.documentName,
        });
      },
    },
  ],
});

export default server;
