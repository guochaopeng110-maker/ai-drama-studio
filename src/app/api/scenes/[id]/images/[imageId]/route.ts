import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scenes/[id]/images/[imageId] - Get a specific scene image
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: sceneId, imageId } = await params

    const sceneImage = await db.sceneImage.findFirst({
      where: { id: imageId, sceneId },
    })

    if (!sceneImage) {
      return NextResponse.json({ error: 'Scene image not found' }, { status: 404 })
    }

    return NextResponse.json(sceneImage)
  } catch (error) {
    console.error('Failed to get scene image:', error)
    return NextResponse.json({ error: 'Failed to get scene image' }, { status: 500 })
  }
}

// PATCH /api/scenes/[id]/images/[imageId] - Update scene image
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: sceneId, imageId } = await params

    const existing = await db.sceneImage.findFirst({
      where: { id: imageId, sceneId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Scene image not found' }, { status: 404 })
    }

    const body = await request.json()
    const { description, isSelected, timeOfDay, angle, imageUrl } = body as {
      description?: string
      isSelected?: boolean
      timeOfDay?: string
      angle?: string
      imageUrl?: string
    }

    const updateData: Record<string, unknown> = {}

    if (description !== undefined) updateData.description = description
    if (timeOfDay !== undefined) updateData.timeOfDay = timeOfDay
    if (angle !== undefined) updateData.angle = angle
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl

    // Handle selection toggle
    if (isSelected === true) {
      // Deselect all other images for this scene first
      await db.sceneImage.updateMany({
        where: { sceneId, isSelected: true },
        data: { isSelected: false },
      })
      updateData.isSelected = true

      // Update scene's imageUrl to this image
      const newImageUrl = imageUrl || existing.imageUrl
      if (newImageUrl) {
        await db.scene.update({
          where: { id: sceneId },
          data: { imageUrl: newImageUrl },
        })
      }
    } else if (isSelected === false) {
      updateData.isSelected = false
    }

    const sceneImage = await db.sceneImage.update({
      where: { id: imageId },
      data: updateData,
    })

    return NextResponse.json(sceneImage)
  } catch (error) {
    console.error('Failed to update scene image:', error)
    return NextResponse.json({ error: 'Failed to update scene image' }, { status: 500 })
  }
}

// DELETE /api/scenes/[id]/images/[imageId] - Delete a scene image
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: sceneId, imageId } = await params

    const existing = await db.sceneImage.findFirst({
      where: { id: imageId, sceneId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Scene image not found' }, { status: 404 })
    }

    await db.sceneImage.delete({
      where: { id: imageId },
    })

    // If the deleted image was selected, select another one if available
    if (existing.isSelected) {
      const nextImage = await db.sceneImage.findFirst({
        where: { sceneId },
        orderBy: { createdAt: 'desc' },
      })
      if (nextImage) {
        await db.sceneImage.update({
          where: { id: nextImage.id },
          data: { isSelected: true },
        })
        if (nextImage.imageUrl) {
          await db.scene.update({
            where: { id: sceneId },
            data: { imageUrl: nextImage.imageUrl },
          })
        }
      } else {
        // No more images, clear scene imageUrl
        await db.scene.update({
          where: { id: sceneId },
          data: { imageUrl: null },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete scene image:', error)
    return NextResponse.json({ error: 'Failed to delete scene image' }, { status: 500 })
  }
}
