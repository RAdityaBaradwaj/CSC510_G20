import { config } from 'dotenv';
import { z } from 'zod';

config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
});

export const env = EnvSchema.parse(process.env);
