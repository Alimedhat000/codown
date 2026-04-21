import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import morgan from 'morgan';
import { TokenIndexer } from 'morgan';
import path from 'path';

import { logger } from '../lib/logger';

const generateRequestId = (): string => {
  return crypto.randomBytes(4).toString('hex');
};

// Ensure logs folder exists
const logDir = path.join(path.resolve(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Winston stream (colorful + clean)
const morganStream = {
  write: (message: string) => logger.info?.(message.trim()),
};

// Add request ID to morgan
morgan.token('requestId', (req: IncomingMessage) => {
  const id = (req as IncomingMessage & { requestId?: string }).requestId;
  return id || 'unknown';
});

// Add IP address to morgan
morgan.token('clientIp', (req: IncomingMessage) => {
  const ip = req.socket?.remoteAddress || req.headers['x-forwarded-for'] as string || '-';
  return ip.replace('::ffff:', '').replace('::1', 'localhost');
});

// Optional file stream (logs raw HTTP details)
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), {
  flags: 'a',
});

// Colored custom format
const coloredFormat = (
  tokens: TokenIndexer<IncomingMessage, ServerResponse>,
  req: IncomingMessage,
  res: ServerResponse
): string => {
  const statusCode = tokens.status?.(req, res);
  const status = statusCode ? Number(statusCode) : 500;
  const statusColor =
    status >= 500
      ? chalk.red(status)
      : status >= 400
        ? chalk.yellow(status)
        : status >= 300
          ? chalk.cyan(status)
          : chalk.green(status);

  const method = chalk.magenta(tokens.method?.(req, res) ?? '');
  const url = chalk.blue(tokens.url?.(req, res) ?? '');
  const time = chalk.gray(`${tokens['response-time']?.(req, res) ?? '0'} ms`);
  const length = chalk.white(tokens.res?.(req, res, 'content-length') ?? '0');

  const requestId = tokens.requestId?.(req, res) || 'unknown';
  const clientIp = tokens.clientIp?.(req, res) || '-';

  return `[${requestId}] [${clientIp}] ${method} ${url} ${statusColor} - ${length}b - ${time}`;
};

// Request ID middleware - generate ID for each request
export const requestIdMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): void => {
  const id = generateRequestId();
  (req as IncomingMessage & { requestId: string }).requestId = id;
  next();
};

// Exported middlewares
export const morganWinston = morgan(coloredFormat, { stream: morganStream });
export const morganFile = morgan('combined', { stream: accessLogStream });
