import { z } from 'zod';

export const AddCollaboratorSchema = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .transform(email => email.trim().toLowerCase()),
  permission: z.enum(['edit', 'view']).default('edit'),
});

export type AddCollaboratorSchema = z.infer<typeof AddCollaboratorSchema>;
