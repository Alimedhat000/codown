/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodObject } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { AppError } from '@/exceptions/AppError';

export interface ValidateParams {
  body?: ZodObject<any>;
  params?: ZodObject<any>;
  query?: ZodObject<any>;
}

export const validate =
  ({ body, params, query }: ValidateParams) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }
      if (params) {
        req.params = params.parse(req.params);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(StatusCodes.BAD_REQUEST, fromZodError(error).toString(), error));
      } else {
        next(error);
      }
    }
  };
