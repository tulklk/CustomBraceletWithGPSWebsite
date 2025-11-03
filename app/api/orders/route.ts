import { NextResponse } from 'next/server'
import { Order } from '@/lib/types'

// Helper function to create design object
function createDesign(
  productId: string,
  templateId: string,
  color: string,
  engrave: { text: string; font: 'Sans' | 'Rounded' | 'Mono'; position: 'inside' | 'band' } | null,
  unitPrice: number
) {
  return {
    productId,
    templateId,
    colors: {
      band: color,
      face: color,
      rim: color,
    },
    accessories: [],
    engrave: engrave || undefined,
    unitPrice,
  }
}

// Mock orders data
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2025-001',
    customer: {
      name: 'Nguyễn Thị Hương',
      email: 'huong.nguyen@email.com',
      phone: '0912345678',
      address: '123 Đường Trần Hưng Đạo, Quận 1, TP.HCM',
    },
    items: [
      {
        id: 'item-1',
        design: createDesign(
          'bracelet-1',
          'bunny-baby-pink',
          '#FFC0CB',
          { text: 'Bé Minh', font: 'Sans', position: 'inside' },
          400000
        ),
        qty: 2,
      },
    ],
    total: 800000,
    status: 'completed',
    createdAt: '2025-01-20T10:30:00.000Z',
  },
  {
    id: 'ORD-2025-002',
    customer: {
      name: 'Trần Văn Nam',
      email: 'nam.tran@email.com',
      phone: '0987654321',
      address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
    },
    items: [
      {
        id: 'item-2',
        design: createDesign(
          'bracelet-1',
          'bunny-lavender',
          '#E6E6FA',
          { text: 'Baby Anh', font: 'Sans', position: 'inside' },
          400000
        ),
        qty: 1,
      },
      {
        id: 'item-3',
        design: createDesign(
          'necklace-1',
          'necklace-baby-pink',
          '#FFC0CB',
          null,
          150000
        ),
        qty: 1,
      },
    ],
    total: 550000,
    status: 'processing',
    createdAt: '2025-01-22T14:20:00.000Z',
  },
  {
    id: 'ORD-2025-003',
    customer: {
      name: 'Lê Thị Mai',
      email: 'mai.le@email.com',
      phone: '0901234567',
      address: '789 Lê Lợi, Quận 3, TP.HCM',
    },
    items: [
      {
        id: 'item-4',
        design: createDesign(
          'clip-1',
          'clip-pink',
          '#FFB6C1',
          null,
          100000
        ),
        qty: 3,
      },
    ],
    total: 300000,
    status: 'completed',
    createdAt: '2025-01-23T09:15:00.000Z',
  },
  {
    id: 'ORD-2025-004',
    customer: {
      name: 'Phạm Minh Tuấn',
      email: 'tuan.pham@email.com',
      phone: '0938765432',
      address: '321 Võ Văn Tần, Quận 3, TP.HCM',
    },
    items: [
      {
        id: 'item-5',
        design: createDesign(
          'bracelet-1',
          'bunny-yellow',
          '#FFFF99',
          { text: 'Thiên Ân', font: 'Sans', position: 'inside' },
          400000
        ),
        qty: 1,
      },
      {
        id: 'item-6',
        design: createDesign(
          'necklace-1',
          'necklace-yellow',
          '#FFFF99',
          null,
          150000
        ),
        qty: 2,
      },
    ],
    total: 700000,
    status: 'pending',
    createdAt: '2025-01-24T16:45:00.000Z',
  },
  {
    id: 'ORD-2025-005',
    customer: {
      name: 'Hoàng Văn Đức',
      email: 'duc.hoang@email.com',
      phone: '0945678901',
      address: '555 Pasteur, Quận 1, TP.HCM',
    },
    items: [
      {
        id: 'item-7',
        design: createDesign(
          'bracelet-1',
          'bunny-mint',
          '#98FF98',
          { text: 'Gia Bảo', font: 'Sans', position: 'inside' },
          400000
        ),
        qty: 1,
      },
    ],
    total: 400000,
    status: 'processing',
    createdAt: '2025-01-25T11:00:00.000Z',
  },
  {
    id: 'ORD-2025-006',
    customer: {
      name: 'Đặng Thị Lan',
      email: 'lan.dang@email.com',
      phone: '0976543210',
      address: '888 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    },
    items: [
      {
        id: 'item-8',
        design: createDesign(
          'necklace-1',
          'necklace-lavender',
          '#E6E6FA',
          null,
          150000
        ),
        qty: 5,
      },
    ],
    total: 750000,
    status: 'completed',
    createdAt: '2025-01-26T08:30:00.000Z',
  },
  {
    id: 'ORD-2025-007',
    customer: {
      name: 'Vũ Minh Khoa',
      email: 'khoa.vu@email.com',
      phone: '0923456789',
      address: '111 Đinh Tiên Hoàng, Quận Bình Thạnh, TP.HCM',
    },
    items: [
      {
        id: 'item-9',
        design: createDesign(
          'clip-1',
          'clip-baby-pink',
          '#FFB6C1',
          null,
          100000
        ),
        qty: 2,
      },
      {
        id: 'item-10',
        design: createDesign(
          'clip-1',
          'clip-lavender',
          '#E6E6FA',
          null,
          100000
        ),
        qty: 2,
      },
    ],
    total: 400000,
    status: 'pending',
    createdAt: '2025-01-27T13:20:00.000Z',
  },
  {
    id: 'ORD-2025-008',
    customer: {
      name: 'Bùi Thị Ngọc',
      email: 'ngoc.bui@email.com',
      phone: '0934567890',
      address: '222 Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM',
    },
    items: [
      {
        id: 'item-11',
        design: createDesign(
          'bracelet-1',
          'bunny-pink',
          '#FFB6C1',
          { text: 'Phương Anh', font: 'Sans', position: 'inside' },
          400000
        ),
        qty: 1,
      },
      {
        id: 'item-12',
        design: createDesign(
          'necklace-1',
          'necklace-pink',
          '#FFB6C1',
          null,
          150000
        ),
        qty: 1,
      },
      {
        id: 'item-13',
        design: createDesign(
          'clip-1',
          'clip-pink',
          '#FFB6C1',
          null,
          100000
        ),
        qty: 1,
      },
    ],
    total: 650000,
    status: 'completed',
    createdAt: '2025-01-28T15:10:00.000Z',
  },
  {
    id: 'ORD-2025-009',
    customer: {
      name: 'Ngô Văn Hải',
      email: 'hai.ngo@email.com',
      phone: '0967890123',
      address: '333 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    },
    items: [
      {
        id: 'item-14',
        design: createDesign(
          'necklace-1',
          'necklace-mint',
          '#98FF98',
          null,
          150000
        ),
        qty: 3,
      },
    ],
    total: 450000,
    status: 'processing',
    createdAt: '2025-10-28T09:40:00.000Z',
  },
  {
    id: 'ORD-2025-010',
    customer: {
      name: 'Trương Thị Thu',
      email: 'thu.truong@email.com',
      phone: '0956789012',
      address: '444 Phan Xích Long, Quận Phú Nhuận, TP.HCM',
    },
    items: [
      {
        id: 'item-15',
        design: createDesign(
          'bracelet-1',
          'bunny-baby-pink',
          '#FFC0CB',
          { text: 'Kim Ngân', font: 'Sans', position: 'inside' },
          400000
        ),
        qty: 2,
      },
      {
        id: 'item-16',
        design: createDesign(
          'clip-1',
          'clip-yellow',
          '#FFFF99',
          null,
          100000
        ),
        qty: 2,
      },
    ],
    total: 1000000,
    status: 'pending',
    createdAt: '2025-10-28T12:00:00.000Z',
  },
]

export async function GET() {
  // Return mock orders
  return NextResponse.json(MOCK_ORDERS)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Mock order creation
  const order: Order = {
    id: `ORD-${Date.now()}`,
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
