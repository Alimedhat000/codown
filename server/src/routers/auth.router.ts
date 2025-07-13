import express from 'express';

import { loginUser, logoutUser, refreshToken, registerUser } from '@/controllers/auth.controller';
import { authenticate, validateRefreshToken } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { LoginUserSchema } from '@/validations/login.schema';
import { RegisterUserSchema } from '@/validations/register.schema';

export const authRouter = express.Router();

authRouter.post('/register', validate({ body: RegisterUserSchema }), registerUser);
authRouter.post('/login', validate({ body: LoginUserSchema }), loginUser);
authRouter.post('/logout', authenticate, logoutUser);
authRouter.post('/refresh', validateRefreshToken, refreshToken);
