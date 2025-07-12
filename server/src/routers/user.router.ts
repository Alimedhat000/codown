import express from 'express';

import { loginUser, registerUser } from '@/controllers/user.controller';
import { validate } from '@/middlewares/validation.middleware';
import { LoginUserSchema } from '@/validations/login.schema';
import { RegisterUserSchema } from '@/validations/register.schema';

export const authRouter = express.Router();

authRouter.post('/register', validate({ body: RegisterUserSchema }), registerUser);
authRouter.post('/login', validate({ body: LoginUserSchema }), loginUser);
