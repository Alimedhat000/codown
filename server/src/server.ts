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

import socketServer from './sockets/ws-server';

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

if (process.env.NODE_ENV !== 'test') {
  // Logger middleware
  app.use(morganFile);
  app.use(morganWinston);
}
// Serving static files
app.use(express.static(path.join(path.resolve(), 'public')));

// Routes
app.use('/api', router);

// Error middlewaree
app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  const server = http.createServer(app);

  socketServer.listen(5002, () => {
    console.log(chalk.green('Hocus Pocus server is running on ws://localhost:5002'));
  });

  server.listen(process.env.PORT, () => {
    console.log(chalk.cyan(`Server is running on http://localhost:${process.env.PORT}`));
  });
}

// // Export function to start server programmatically (for tests)
// export function startServer(port?: number) {
//   const serverPort = port || process.env.PORT || 5001;
//   const server = http.createServer(app);

//   return new Promise<http.Server>((resolve, reject) => {
//     const httpServer = server.listen(serverPort, (err?: any) => {
//       if (err) {
//         reject(err);
//       } else {
//         console.log(chalk.cyan(`Test server running on http://localhost:${serverPort}`));
//         resolve(httpServer);
//       }
//     });
//   });
// }
