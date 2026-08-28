import { z } from 'zod';

export const IdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type IdParamsSchema = z.infer<typeof IdParamsSchema>;

export const RequestIdParamsSchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
});

export type RequestIdParamsSchema = z.infer<typeof RequestIdParamsSchema>;

export const CollaboratorParamsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

export type CollaboratorParamsSchema = z.infer<typeof CollaboratorParamsSchema>;

export const ShareLinkQuerySchema = z.object({
  permission: z.enum(['view', 'edit']).default('view'),
});

export type ShareLinkQuerySchema = z.infer<typeof ShareLinkQuerySchema>;
