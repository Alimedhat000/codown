import * as z from 'zod';

const createEnv = () => {
  const envSchema = z.object({
    API_URL: z.string().url(),
  });

  const envVars = Object.entries(import.meta.env).reduce<
    Record<string, string>
  >((acc, curr) => {
    const [key, value] = curr;
    if (key.startsWith('VITE_APP_')) {
      acc[key.replace('VITE_APP_', '')] = value;
    }
    return acc;
  }, {});

  const parsedEnv = envSchema.safeParse(envVars);
  if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error);
    throw new Error('Invalid environment variables');
  }
  return parsedEnv.data;
};

export const env = createEnv();
