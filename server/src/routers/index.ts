import express from 'express';

import { authRouter } from './user.router';

export const router = express.Router();

router.use('/auth', authRouter);
