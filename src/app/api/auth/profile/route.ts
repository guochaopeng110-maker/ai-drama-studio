import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// ============================================================
// GET /api/auth/profile — Get current user profile
// ============================================================

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { dramas: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('[auth/profile] GET Error:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}

// ============================================================
// PATCH /api/auth/profile — Update current user profile
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { name, avatar } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await db.user.update({
      where: { id: (session.user as any).id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('[auth/profile] PATCH Error:', error)
    return NextResponse.json({ error: '更新用户信息失败' }, { status: 500 })
  }
}
