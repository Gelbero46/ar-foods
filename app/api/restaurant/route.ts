import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(restaurants)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    if (!name) {
      return NextResponse.json(
        { error: 'Restaurant name is required' },
        { status: 400 }
      )
    }
    const restaurant = await prisma.restaurant.create({
      data: { name }
    })
    return NextResponse.json(restaurant, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}