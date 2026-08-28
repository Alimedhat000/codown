import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .transform(email => email.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

export type LoginUserSchema = z.infer<typeof LoginUserSchema>;
