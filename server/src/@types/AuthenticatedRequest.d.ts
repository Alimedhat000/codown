import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

// Make it globally available
declare global {
  type AuthenticatedRequest = import('./global').AuthenticatedRequest;
}
