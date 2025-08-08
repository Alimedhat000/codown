import { Logger } from '@hocuspocus/extension-logger';
import { Hocuspocus } from '@hocuspocus/server';

import { dbPersistence } from '@/lib/dbPersistence';

const server = new Hocuspocus({
  // port: 5002,
  quiet: true,
  extensions: [dbPersistence, new Logger()],
});

export default server;
