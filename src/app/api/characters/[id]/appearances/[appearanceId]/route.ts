import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/characters/[id]/appearances/[appearanceId] - Get a specific appearance
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; appearanceId: string }> }
) {
  try {
    const { id: characterId, appearanceId } = await params

    const appearance = await db.characterAppearance.findFirst({
      where: { id: appearanceId, characterId },
    })

    if (!appearance) {
      return NextResponse.json({ error: 'Appearance not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...appearance,
      imageUrls: JSON.parse(appearance.imageUrls),
    })
  } catch (error) {
    console.error('Failed to get appearance:', error)
    return NextResponse.json({ error: 'Failed to get appearance' }, { status: 500 })
  }
}

// PATCH /api/characters/[id]/appearances/[appearanceId] - Update appearance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appearanceId: string }> }
) {
  try {
    const { id: characterId, appearanceId } = await params

    const existing = await db.characterAppearance.findFirst({
      where: { id: appearanceId, characterId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Appearance not found' }, { status: 404 })
    }

    const body = await request.json()
    const { label, selectedIndex, imageUrl } = body as {
      label?: string
      selectedIndex?: number
      imageUrl?: string
    }

    const updateData: Record<string, unknown> = {}

    if (label !== undefined) {
      updateData.label = label
    }

    if (selectedIndex !== undefined) {
      const imageUrls: string[] = JSON.parse(existing.imageUrls)
      if (selectedIndex < 0 || selectedIndex >= imageUrls.length) {
        return NextResponse.json(
          { error: `selectedIndex ${selectedIndex} out of range (0-${imageUrls.length - 1})` },
          { status: 400 }
        )
      }
      updateData.selectedIndex = selectedIndex
      // Update imageUrl from imageUrls[selectedIndex]
      updateData.imageUrl = imageUrls[selectedIndex]
      // Save previous imageUrl for rollback
      updateData.previousImageUrl = existing.imageUrl
    } else if (imageUrl !== undefined) {
      // Directly set imageUrl (e.g., from a new generation)
      updateData.imageUrl = imageUrl
      // Also append to imageUrls array
      const imageUrls: string[] = JSON.parse(existing.imageUrls)
      imageUrls.push(imageUrl)
      updateData.imageUrls = JSON.stringify(imageUrls)
      updateData.selectedIndex = imageUrls.length - 1
      updateData.previousImageUrl = existing.imageUrl
    }

    const appearance = await db.characterAppearance.update({
      where: { id: appearanceId },
      data: updateData,
    })

    // If this is the primary appearance (index 0), also update the character's imageUrl
    if (existing.appearanceIndex === 0 && updateData.imageUrl) {
      await db.character.update({
        where: { id: characterId },
        data: { imageUrl: updateData.imageUrl as string },
      })
    }

    return NextResponse.json({
      ...appearance,
      imageUrls: JSON.parse(appearance.imageUrls),
    })
  } catch (error) {
    console.error('Failed to update appearance:', error)
    return NextResponse.json({ error: 'Failed to update appearance' }, { status: 500 })
  }
}

// DELETE /api/characters/[id]/appearances/[appearanceId] - Delete an appearance
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; appearanceId: string }> }
) {
  try {
    const { id: characterId, appearanceId } = await params

    const existing = await db.characterAppearance.findFirst({
      where: { id: appearanceId, characterId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Appearance not found' }, { status: 404 })
    }

    await db.characterAppearance.delete({
      where: { id: appearanceId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete appearance:', error)
    return NextResponse.json({ error: 'Failed to delete appearance' }, { status: 500 })
  }
}
