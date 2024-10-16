import { env } from './env'

import { type Knex, knex as setupKnex } from 'knex'

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL,
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },

  useNullAsDefault: true,
}

export const knex = setupKnex(config)
