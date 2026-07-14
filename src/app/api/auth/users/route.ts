import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// ============================================================
// GET /api/auth/users — List all users (admin only)
// ============================================================

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const role = (session.user as any).role
    if (role !== 'admin') {
      return NextResponse.json({ error: '无权限，仅管理员可查看用户列表' }, { status: 403 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        _count: { select: { dramas: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('[auth/users] GET Error:', error)
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
  }
}

// ============================================================
// PATCH /api/auth/users — Update user role/active status (admin only)
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const currentRole = (session.user as any).role
    if (currentRole !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role, isActive } = body

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
    }

    // Prevent admin from deactivating themselves
    if (userId === (session.user as any).id && isActive === false) {
      return NextResponse.json({ error: '不能禁用自己的账号' }, { status: 400 })
    }

    const updateData: any = {}
    if (role !== undefined) {
      if (!['free', 'pro', 'admin'].includes(role)) {
        return NextResponse.json({ error: '无效的角色' }, { status: 400 })
      }
      updateData.role = role
    }
    if (isActive !== undefined) updateData.isActive = isActive

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('[auth/users] PATCH Error:', error)
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
  }
}
