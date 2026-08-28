import express from 'express';

import { loginUser, logoutUser, refreshToken, registerUser } from '@/controllers/auth.controller';
import { validateRefreshToken } from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/rate-limit.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { LoginUserSchema } from '@/validations/login.schema';
import { RegisterUserSchema } from '@/validations/register.schema';

export const authRouter = express.Router();

authRouter.post('/register', authLimiter, validate({ body: RegisterUserSchema }), registerUser);
authRouter.post('/login', authLimiter, validate({ body: LoginUserSchema }), loginUser);
authRouter.post('/logout', validateRefreshToken, logoutUser);
authRouter.post('/refresh', authLimiter, validateRefreshToken, refreshToken);
