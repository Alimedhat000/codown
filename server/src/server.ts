import '@/config/env.config';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import expressWebsockets from 'express-ws';
import helmet from 'helmet';
import path from 'path';

import { logger } from '@/lib/logger';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { morganFile, morganWinston, requestIdMiddleware } from '@/middlewares/logging.middleware';
import { router } from '@/routers';

import { setupSwagger } from './config/swagger';
import socketServer from './sockets/ws-server';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const { app } = expressWebsockets(express());

// Helmet => HTTP Security Headers.
app.use(helmet());

// Json parser
app.use(express.json());

// Cors middleware — the browser calls this API cross-origin in dev (Vite :5173)
// and in prod too: nginx serves only the SPA with no /api proxy
// (see client/nginx.conf), so the allowlist must include CLIENT_BASE.
const allowedOrigins = [
  process.env.CLIENT_BASE ?? 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

// Request ID for tracing
app.use(requestIdMiddleware);

if (!isProduction && !isTest) {
  app.use(morganFile);
  app.use(morganWinston);
}

// Serving static files
app.use(express.static(path.join(path.resolve(), 'public')));

setupSwagger(app);

// Health check
app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api', router);

// Error middlewaree
app.use(errorMiddleware);

if (!isTest) {
  app.ws('/collaboration', (websocket, request) => {
    socketServer.handleConnection(websocket, request);
  });

  app.listen(process.env.PORT, () => {
    logger.info(`API server started on port ${process.env.PORT}`, {
      action: 'SERVER_START',
    });
  });
}
