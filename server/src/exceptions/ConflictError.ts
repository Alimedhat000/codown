import { StatusCodes } from 'http-status-codes';

import { AppError } from './AppError';

export class ConflictError extends AppError {
  constructor(message?: string) {
    super(StatusCodes.CONFLICT, message ?? 'Conflict');
  }
}
