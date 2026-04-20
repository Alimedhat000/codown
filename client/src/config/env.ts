import * as z from 'zod';

const createEnv = () => {
  const envSchema = z.object({
    API_URL: z.string().url(),
    Socket_URL: z.string(),
  });

  const keyMapping: Record<string, string> = {
    VITE_APP_SOCKET_URL: 'Socket_URL',
  };

  const envVars = Object.entries(import.meta.env).reduce<
    Record<string, string>
  >((acc, curr) => {
    const [key, value] = curr;
    if (key.startsWith('VITE_APP_')) {
      const newKey = keyMapping[key] || key.replace('VITE_APP_', '');
      acc[newKey] = value;
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
