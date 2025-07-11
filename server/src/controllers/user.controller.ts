import { Request, Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

// import { prisma } from '@/lib/prisma';
// import { CreateUserSchema } from '@/validations/create-user.schema';

export const helloWorld = asyncErrorWrapper(async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).send('Hello World!');
});
