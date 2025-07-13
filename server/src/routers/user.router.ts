import express from 'express';

import { getUser } from '@/controllers/user.controller';
import { authenticate } from '@/middlewares/auth.middleware';

export const authRouter = express.Router();

authRouter.get('/', authenticate, getUser);
