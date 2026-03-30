import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  try {
     const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status') || 'active'

    const items = await prisma.menuItem.findMany({
      where: {
        ...(restaurantId && { restaurantId }),
        status,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
     const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const {
      restaurantId,
      name,
      price,
      description,
      calories,
      ingredients,
      thumbnailUrl,
      glbUrl,
      usdzUrl,
      status,
    } = body

    if (!restaurantId || !name || !price || !glbUrl || !usdzUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        name,
        price,
        description,
        calories,
        ingredients: ingredients || [],
        thumbnailUrl,
        glbUrl,
        usdzUrl,
        status: status || 'active',
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.log("error", error)
    return NextResponse.json(
      { error: error },
      { status: 500 }
    )
  }
}