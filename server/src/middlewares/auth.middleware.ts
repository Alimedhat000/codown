import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = { userId: decoded.userId, username: decoded.username };
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
  }
};

export const validateRefreshToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as JwtPayload;
    req.user = { userId: decoded.userId, username: decoded.username };
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
    return;
  }
};
