import { NextResponse } from 'next/server'
import { Order } from '@/lib/types'

export async function POST(request: Request) {
  const body = await request.json()
  
  // Mock order creation
  const order: Order = {
    id: `ORDER-${Date.now()}`,
    items: body.items,
    total: body.total,
    customer: body.customer,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(order)
}

