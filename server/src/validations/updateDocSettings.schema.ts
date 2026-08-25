import { z } from 'zod';

export const UpdateDocSettingsSchema = z.object({
  allowSelfJoin: z.boolean(),
});

export type UpdateDocSettingsSchema = z.infer<typeof UpdateDocSettingsSchema>;
