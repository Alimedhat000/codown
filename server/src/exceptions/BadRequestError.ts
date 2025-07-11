import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import { AppError } from './AppError';

export class BadRequestError extends AppError {
  constructor(message?: string) {
    super(StatusCodes.BAD_REQUEST, message ?? ReasonPhrases.BAD_REQUEST);
  }
}
