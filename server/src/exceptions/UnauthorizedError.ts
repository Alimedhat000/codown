import { StatusCodes } from 'http-status-codes';

import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(StatusCodes.UNAUTHORIZED, message ?? 'You are not authorized to access this route.');
  }
}
