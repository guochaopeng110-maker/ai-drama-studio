import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, canCreateProject } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/dramas - List dramas (filtered by user, or all for admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Admin can see all projects; others see only their own
    const where = role === 'admin' ? {} : { userId };

    const dramas = await db.drama.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            episodes: true,
            characters: true,
            scenes: true,
          },
        },
      },
    });

    const result = dramas.map((d) => ({
      ...d,
      _count: {
        episodes: d._count.episodes,
        characters: d._count.characters,
        scenes: d._count.scenes,
      },
    }));

    return NextResponse.json({ dramas: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    console.error('Failed to list dramas:', message, stack);
    return NextResponse.json(
      { error: 'Failed to list dramas', detail: message },
      { status: 500 }
    );
  }
}

// POST /api/dramas - Create a new drama
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Check project limit
    const currentCount = await db.drama.count({
      where: { userId },
    });

    if (!canCreateProject(role, currentCount)) {
      return NextResponse.json(
        { error: `免费用户最多创建3个项目，当前已有${currentCount}个。升级专业版可无限制创建。` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, genre, style } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const drama = await db.drama.create({
      data: {
        title,
        description: description || '',
        genre: genre || '都市',
        style: style || 'realistic',
        userId,
      },
    });

    return NextResponse.json(drama, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Failed to create drama:', message);
    return NextResponse.json(
      { error: 'Failed to create drama', detail: message },
      { status: 500 }
    );
  }
}
