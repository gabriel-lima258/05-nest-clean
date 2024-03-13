import { config } from 'dotenv'

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { execSync } from 'child_process'
import { DomainEvents } from '@/core/events/domain-events'
import { Redis } from 'ioredis'
import { envSchema } from '@/infra/env/env'

// loading env variables, if it exists a same names in test override them
config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

// get env variables to set on redis
const env = envSchema.parse(process.env)

const prisma = new PrismaClient()
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
})

// function to change the database schema
function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE URL environment variable')
  }

  const url = new URL(env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  // subscribe Database_url the new one
  process.env.DATABASE_URL = databaseURL

  // no event will be dispatched until set as true
  DomainEvents.shouldRun = false

  // delete db from cache every test run
  await redis.flushdb()

  // run on terminal the migration
  execSync('npx prisma migrate deploy')
})

// delete the schema database
afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
