import express from 'express';

import { helloWorld } from '@/controllers/user.controller';
// import { validate } from '@/middlewares/validation.middleware';
// import { createUserSchema } from '@/validations/create-user.schema';

export const userRouter = express.Router();

userRouter.get('/me', helloWorld);
// userRouter.post('/', validate({ body: createUserSchema }), createUser);
