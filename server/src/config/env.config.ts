import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

dotenv.config({ path: path.join(path.resolve(), '.env') });

const envVarsSchema = z.object({
  PORT: z.string(),
  NODE_ENV: z.enum(['development', 'production']),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.string(),
  DATABASE_URL: z.string(),
});

const parseEnvResult = envVarsSchema.safeParse(process.env);

if (!parseEnvResult.success) {
  throw chalk.underline.green.bgRed(
    fromZodError(parseEnvResult.error, { prefix: 'Environment variables validation failed' }).toString()
  );
}

export type EnvVars = z.infer<typeof envVarsSchema>;
