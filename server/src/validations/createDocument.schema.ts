import { z } from 'zod';

export const CreateDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(1_000_000).optional(),
  isPublic: z.boolean().default(false),
});

export type CreateDocumentSchema = z.infer<typeof CreateDocumentSchema>;
