import '@/config/env.config';

import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import path from 'path';

import { errorMiddleware } from '@/middlewares/error.middleware';
import { morganFile, morganWinston } from '@/middlewares/logging.middleware';
import { router } from '@/routers';

import { setupYjsWebSocketServer } from './sockets/yjs-server';

export const app = express();

// Helmet => HTTP Security Headers.
app.use(helmet());

// Json parser
app.use(express.json());

// Cors middleware
app.use(
  cors({
    origin: 'http://localhost:5173', // your frontend origin
    credentials: true, // allow cookies
  })
);

// Cookie parser
app.use(cookieParser());

// Logger middleware
app.use(morganFile);
app.use(morganWinston);

// Serving static files
app.use(express.static(path.join(path.resolve(), 'public')));

// Routes
app.use('/api', router);

// Error middlewaree
app.use(errorMiddleware);

const server = http.createServer(app);

setupYjsWebSocketServer(server);

server.listen(process.env.PORT, () => {
  console.log(chalk.cyan(`Server is running on http://localhost:${process.env.PORT}`));
});
