import '@/config/env.config';

import cookieParser from 'cookie-parser';
import { logger } from '@/lib/logger';
// import cors from 'cors';
import express from 'express';
import expressWebsockets from 'express-ws';
import helmet from 'helmet';
import path from 'path';

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

// const allowedOrigins = ['http://localhost:5173', 'http://localhost', 'http://localhost:3000'];

// Cors middleware
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   })
// );

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
