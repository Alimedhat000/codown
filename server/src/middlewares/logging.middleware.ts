import fs from 'fs';
import morgan from 'morgan';
import path from 'path';

import { logger } from '../lib/logger';

// Ensure logs folder exists
const logDir = path.join(path.resolve(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Stream for winston
const morganStream = {
  write: (message: string) => logger.http?.(message.trim()),
};

// Optional: file stream
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), {
  flags: 'a',
});

export const morganWinston = morgan('combined', { stream: morganStream });
export const morganFile = morgan('common', { stream: accessLogStream });
