import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .transform(email => email.trim().toLowerCase()),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username may only contain letters, digits, dots, dashes and underscores'),
  password: z.string().min(8).max(128),
  fullName: z.string().max(100).optional(),
});

export type RegisterUserSchema = z.infer<typeof RegisterUserSchema>;
