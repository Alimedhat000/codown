import express from 'express';

import { getUser } from '@/controllers/user.controller';
import { authenticate } from '@/middlewares/auth.middleware';

export const userRouter = express.Router();

userRouter.get('/', authenticate, getUser);
