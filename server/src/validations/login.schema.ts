import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserSchema = z.infer<typeof LoginUserSchema>;
