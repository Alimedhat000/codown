import '@/config/env.config';

import chalk from 'chalk';
import cookieParser from 'cookie-parser';
// import cors from 'cors';
import express from 'express';
import expressWebsockets from 'express-ws';
import helmet from 'helmet';
import path from 'path';

import { errorMiddleware } from '@/middlewares/error.middleware';
import { morganFile, morganWinston } from '@/middlewares/logging.middleware';
import { router } from '@/routers';

import { setupSwagger } from './config/swagger';
import socketServer from './sockets/ws-server';

export const { app } = expressWebsockets(express());

// Helmet => HTTP Security Headers.
app.use(helmet());

// Json parser
app.use(express.json());

// Cors middleware
// app.use(
//   cors({
//     origin: process.env.CLIENT_BASE, // your frontend origin
//     credentials: true, // allow cookies
//   })
// );

// Cookie parser
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  // Logger middleware
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

if (process.env.NODE_ENV !== 'test') {
  // const server = http.createServer(app);

  // socketServer.listen(Number(process.env.PORT), () => {
  //   console.log(
  //     chalk.bold.green('✓ Hocuspocus server running on ') + chalk.bold.underline.magenta('ws://localhost:5002')
  //   );
  // });

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
