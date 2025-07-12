import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

export type RegisterUserSchema = z.infer<typeof RegisterUserSchema>;
