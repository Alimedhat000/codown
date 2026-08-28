import { z } from 'zod';

export const UpdateDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().max(1_000_000).optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateDocumentSchema = z.infer<typeof UpdateDocumentSchema>;
