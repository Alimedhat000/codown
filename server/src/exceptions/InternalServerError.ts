import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { AppError } from './AppError';

export class InternalServerError extends AppError {
  constructor(message?: string) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message ?? ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
}
