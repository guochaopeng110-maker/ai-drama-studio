import { PrismaClient } from '@prisma/client'

// ============================================================
// Database client initialization
// Dual-mode: Local SQLite fallback + Vercel PostgreSQL
// ============================================================

/**
 * Detect if the current database is PostgreSQL based on URL
 */
function isPostgresUrl(url: string): boolean {
  return url.startsWith('postgresql://') || url.startsWith('postgres://')
}

/**
 * Resolve the best DATABASE_URL from available environment variables.
 * Priority:
 *  1. huobao_POSTGRES_URL_NON_POOLING (Vercel Supabase integration - best for Prisma)
 *  2. huobao_POSTGRES_PRISMA_URL (Vercel Supabase - Prisma-specific pooled)
 *  3. POSTGRES_URL_NON_POOLING (Vercel Postgres without prefix)
 *  4. POSTGRES_PRISMA_URL (Vercel Postgres without prefix)
 *  5. DATABASE_URL (explicitly set - could be PG or SQLite)
 *  6. huobao_POSTGRES_URL (generic Vercel Supabase URL)
 *  7. POSTGRES_URL (generic Vercel Postgres URL)
 *  8. Constructed from individual huobao_POSTGRES_* components
 *  9. Constructed from individual POSTGRES_* components
 *  10. Fallback: SQLite file:./db/custom.db (local dev only)
 */
function resolveDatabaseUrl(): { url: string; directUrl: string; provider: 'postgresql' | 'sqlite' } {
  // 1. Non-pooling URL — best for Prisma (with huobao_ prefix first)
  const huobaoNonPooling = process.env.huobao_POSTGRES_URL_NON_POOLING
  if (huobaoNonPooling) {
    console.log('[db] Using huobao_POSTGRES_URL_NON_POOLING')
    return { url: huobaoNonPooling, directUrl: huobaoNonPooling, provider: 'postgresql' }
  }

  // 2. Prisma-specific pooled URL (with huobao_ prefix first)
  const huobaoPrisma = process.env.huobao_POSTGRES_PRISMA_URL
  if (huobaoPrisma) {
    console.log('[db] Using huobao_POSTGRES_PRISMA_URL')
    return { url: huobaoPrisma, directUrl: huobaoPrisma, provider: 'postgresql' }
  }

  // 3. Non-pooling URL (without prefix)
  const nonPoolingUrl = process.env.POSTGRES_URL_NON_POOLING
  if (nonPoolingUrl) {
    console.log('[db] Using POSTGRES_URL_NON_POOLING')
    return { url: nonPoolingUrl, directUrl: nonPoolingUrl, provider: 'postgresql' }
  }

  // 4. Prisma-specific pooled URL (without prefix)
  const prismaUrl = process.env.POSTGRES_PRISMA_URL
  if (prismaUrl) {
    console.log('[db] Using POSTGRES_PRISMA_URL')
    return { url: prismaUrl, directUrl: prismaUrl, provider: 'postgresql' }
  }

  // 5. Explicitly set DATABASE_URL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    const url = process.env.DATABASE_URL.trim()
    const provider = isPostgresUrl(url) ? 'postgresql' as const : 'sqlite' as const
    const directUrl = process.env.DIRECT_URL || url
    console.log(`[db] Using DATABASE_URL from environment (${provider})`)
    return { url, directUrl, provider }
  }

  // 6. Generic Vercel Supabase URL (with huobao_ prefix)
  const huobaoGeneric = process.env.huobao_POSTGRES_URL
  if (huobaoGeneric) {
    console.log('[db] Using huobao_POSTGRES_URL')
    return { url: huobaoGeneric, directUrl: huobaoGeneric, provider: 'postgresql' }
  }

  // 7. Generic Vercel Postgres URL (without prefix)
  const genericUrl = process.env.POSTGRES_URL
  if (genericUrl) {
    console.log('[db] Using POSTGRES_URL')
    return { url: genericUrl, directUrl: genericUrl, provider: 'postgresql' }
  }

  // 8. Construct from individual huobao_ components
  const huobaoHost = process.env.huobao_POSTGRES_HOST
  const huobaoUser = process.env.huobao_POSTGRES_USER
  const huobaoPassword = process.env.huobao_POSTGRES_PASSWORD
  const huobaoDatabase = process.env.huobao_POSTGRES_DATABASE || 'postgres'
  if (huobaoHost && huobaoUser && huobaoPassword) {
    const url = `postgresql://${huobaoUser}:${huobaoPassword}@${huobaoHost}:5432/${huobaoDatabase}`
    console.log('[db] Constructed URL from huobao_POSTGRES_* components')
    return { url, directUrl: url, provider: 'postgresql' }
  }

  // 9. Construct from individual POSTGRES_* components
  const host = process.env.POSTGRES_HOST
  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD
  const database = process.env.POSTGRES_DATABASE || 'postgres'
  if (host && user && password) {
    const url = `postgresql://${user}:${password}@${host}:5432/${database}`
    console.log('[db] Constructed URL from POSTGRES_* components')
    return { url, directUrl: url, provider: 'postgresql' }
  }

  // 10. Fallback: SQLite for local development
  console.log('[db] No PostgreSQL URL found, falling back to SQLite (local dev)')
  return { url: 'file:./db/custom.db', directUrl: 'file:./db/custom.db', provider: 'sqlite' }
}

// Resolve and set DATABASE_URL before PrismaClient initialization
const { url: databaseUrl, directUrl, provider: dbProvider } = resolveDatabaseUrl()

// Always set DATABASE_URL for Prisma
process.env.DATABASE_URL = databaseUrl

// Set DIRECT_URL for PostgreSQL (needed for Vercel connection pooling)
if (dbProvider === 'postgresql') {
  process.env.DIRECT_URL = process.env.DIRECT_URL || directUrl
}

// PrismaClient singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log the database connection (mask credentials)
const maskedUrl = databaseUrl
  .replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
  .replace(/\?[^#]+/, '?***')
console.log(`[db] Provider: ${dbProvider}, URL: ${maskedUrl.slice(0, 120)}`)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Test database connection on startup (non-blocking)
db.$connect()
  .then(() => console.log('[db] Database connection established successfully'))
  .catch((err) => console.error('[db] FAILED to connect to database:', err.message || err))

// Export provider info for health checks
export function getDbProvider(): string {
  return dbProvider
}
