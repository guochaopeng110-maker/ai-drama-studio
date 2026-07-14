import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dramas/[id]/scenes - List scenes for a drama
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dramaId } = await params;
    const scenes = await db.scene.findMany({
      where: { dramaId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ scenes });
  } catch (error) {
    console.error('Failed to list scenes:', error);
    return NextResponse.json({ error: 'Failed to list scenes' }, { status: 500 });
  }
}

// POST /api/dramas/[id]/scenes - Create scene
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dramaId } = await params;
    const body = await request.json();
    const { location, timeOfDay, description, prompt } = body;

    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    const scene = await db.scene.create({
      data: {
        dramaId,
        location,
        timeOfDay: timeOfDay || 'day',
        description: description || '',
        prompt: prompt || '',
      },
    });

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    console.error('Failed to create scene:', error);
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}
