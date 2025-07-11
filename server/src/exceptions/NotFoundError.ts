import { ReasonPhrases } from 'http-status-codes';

import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(404, message ?? ReasonPhrases.NOT_FOUND);
  }
}
