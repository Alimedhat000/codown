import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '@/exceptions/AppError';
import { NotFoundError } from '@/exceptions/NotFoundError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  let customError = err;

  if (err.name === 'SyntaxError') {
    customError = new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Unexpected Syntax');
  }

  if (err.name === 'NotFoundError') {
    customError = new NotFoundError();
  }
  // Response Json Object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resObj: Record<string, any> = {
    message: customError.message,
  };
  // Show error stack only in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    resObj.stack = err.stack;
  }

  if (err.details) {
    resObj.details = err.details;
  }

  res.status(customError.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).json(resObj);
};
