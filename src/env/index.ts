import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

const _env = schema.safeParse(process.env)

if (!_env.success) {
  console.error('Environment validation error:', _env.error)

  throw new Error('Environment validation error')
}

export const env = _env.data
