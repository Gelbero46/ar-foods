import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
 req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: id },
    })
    if (!item)
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch itemssss' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const body = await req.json()
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    await prisma.menuItem.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}