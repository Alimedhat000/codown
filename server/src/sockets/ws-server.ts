import { Logger } from '@hocuspocus/extension-logger';
import { Server } from '@hocuspocus/server';

import { dbPersistence } from '@/lib/dbPersistence';

const server = new Server({
  port: 5002,
  quiet: true,
  extensions: [dbPersistence, new Logger()],
});

export default server;
