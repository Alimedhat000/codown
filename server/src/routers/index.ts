import express from 'express';

import { authRouter } from './auth.router';
import { userRouter } from './user.router';

export const router = express.Router();

router.use('/user', userRouter);
router.use('/auth', authRouter);
