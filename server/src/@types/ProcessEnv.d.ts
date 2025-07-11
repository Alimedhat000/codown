/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { EnvVars } from '@/config/env.config';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVars {}
  }
}
