import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing token' });
  }

  const token = header.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    if (token) {
      const decoded = jwt.verify(token, secret);

      if (typeof decoded === 'string') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token format' });
      }

      req.user = decoded as JwtPayload;
      next();
    }
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
  }
};
