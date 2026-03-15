// Prisma 7 requires all connection URLs here — not in schema.prisma or PrismaClient constructor
// datasource.url is used by both the client at runtime AND prisma migrate dev
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,   // runtime queries (transaction pooler)
    // @ts-expect-error directUrl is valid at runtime but missing from Prisma 7.5.0 type definition
    directUrl: process.env.DIRECT_URL!, // migrations (session pooler, no pgbouncer)
  },
})
