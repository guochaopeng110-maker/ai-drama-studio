// ============================================================
// Pre-dev script: switches Prisma schema to SQLite for local dev
// The source-of-truth schema uses PostgreSQL (for Vercel)
// This script temporarily adapts it for local SQLite development
// ============================================================

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
const markerPath = path.join(__dirname, '..', 'prisma', '.sqlite-mode')

function switchToSqlite() {
  console.log('[pre-dev] Switching Prisma schema to SQLite for local development...')

  let schema = fs.readFileSync(schemaPath, 'utf8')

  // Replace datasource block
  schema = schema.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`
  )

  fs.writeFileSync(schemaPath, schema)

  // Create marker file so build script knows to switch back
  fs.writeFileSync(markerPath, Date.now().toString())

  // Generate Prisma client for SQLite
  try {
    console.log('[pre-dev] Generating Prisma client for SQLite...')
    execSync('npx prisma generate', { stdio: 'inherit', timeout: 60000 })
    console.log('[pre-dev] Prisma client generated successfully')
  } catch (err) {
    console.warn('[pre-dev] Prisma generate warning:', err.message?.slice(0, 200))
  }

  // Push schema to local SQLite
  try {
    console.log('[pre-dev] Pushing schema to local SQLite...')
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      stdio: 'pipe',
      timeout: 30000,
    })
    console.log('[pre-dev] Schema pushed to SQLite successfully')
  } catch (err) {
    console.warn('[pre-dev] Schema push warning (non-critical)')
  }
}

switchToSqlite()
