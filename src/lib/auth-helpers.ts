import { getServerSession } from 'next-auth'
import { authOptions, canUseAiGeneration, type UserRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// ============================================================
// Reusable auth helpers for API routes
// ============================================================

interface AuthResult {
  userId: string
  role: UserRole
  error?: NextResponse
}

/**
 * Require authentication in an API route.
 * Returns user info or an error response.
 *
 * Usage:
 * ```ts
 * const auth = await requireAuth()
 * if (auth.error) return auth.error
 * const { userId, role } = auth
 * ```
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      userId: '',
      role: 'free',
      error: NextResponse.json({ error: '未登录' }, { status: 401 }),
    }
  }

  return {
    userId: (session.user as any).id,
    role: (session.user as any).role as UserRole,
  }
}

/**
 * Check if user can perform an AI generation action.
 * Tracks daily usage via ImageGeneration table.
 */
export async function checkAiGenerationLimit(role: UserRole): Promise<NextResponse | null> {
  // Count today's generations
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayCount = await db.imageGeneration.count({
    where: {
      createdAt: { gte: todayStart },
    },
  })

  if (!canUseAiGeneration(role, todayCount)) {
    const perms = canUseAiGeneration(role, 0) // just to get the limit info
    return NextResponse.json(
      {
        error: `今日AI生成次数已达上限（${todayCount}次）。升级专业版可无限制使用。`,
        limit: true,
        todayCount,
      },
      { status: 403 }
    )
  }

  return null // No error, allowed
}

/**
 * Combined auth + AI limit check.
 * Returns auth info or error response.
 */
export async function requireAuthWithAiLimit(): Promise<AuthResult & { limitError?: NextResponse }> {
  const auth = await requireAuth()
  if (auth.error) return auth

  const limitError = await checkAiGenerationLimit(auth.role)
  return { ...auth, limitError: limitError ?? undefined }
}
