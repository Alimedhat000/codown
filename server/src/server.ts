import '@/config/env.config';

import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import expressWebsockets from 'express-ws';
import helmet from 'helmet';
import path from 'path';

import { errorMiddleware } from '@/middlewares/error.middleware';
import { morganFile, morganWinston } from '@/middlewares/logging.middleware';
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

const allowedOrigins = ['https://codown.vercel.app', 'http://localhost:5173'];

// Cors middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

if (!isProduction && !isTest) {
  app.use(morganFile);
  app.use(morganWinston);
}

// Serving static files
app.use(express.static(path.join(path.resolve(), 'public')));

setupSwagger(app);
// Routes
app.use('/api', router);

// Error middlewaree
app.use(errorMiddleware);

if (!isTest) {
  app.ws('/collaboration', (websocket, request) => {
    socketServer.handleConnection(websocket, request);
  });

  app.listen(process.env.PORT, () => {
    console.log(
      chalk.green('✓'),
      chalk.bold.cyan('API server running on ') + chalk.bold.underline.magenta(`http://localhost:${process.env.PORT}`)
    );
  });
}
