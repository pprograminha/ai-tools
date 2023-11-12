import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const nodeEnv = z.enum(['development', 'production', 'test'])

export const env = createEnv({
  server: {
    CLOUDFLARE_BUCKET_NAME: z.string().min(1),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
    CLOUDFLARE_SECRET_KEY: z.string().min(1),
    CLOUDFLARE_ACCESS_KEY: z.string().min(1),
    CLOUDFLARE_TOKEN_API: z.string().min(1),
    
    REDIS_DATABASE_URL: z.string().min(1),

    OPENAI_API_KEY: z.string().min(1),
    OPENAI_ORGANIZATION: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_DEFAULT_PROMPT:  z.string().optional(),
    NEXT_PUBLIC_DEFAULT_QUESTION_PROMPT:  z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().min(1),
  },
  shared: {
    NODE_ENV: nodeEnv,
    VERCEL_ENV: z
      .enum(['production', 'preview', 'development'])
      .default('development'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEFAULT_QUESTION_PROMPT: process.env.NEXT_PUBLIC_DEFAULT_QUESTION_PROMPT,
    NEXT_PUBLIC_DEFAULT_PROMPT: process.env.NEXT_PUBLIC_DEFAULT_PROMPT,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  },
})
