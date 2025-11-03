import { NextResponse } from 'next/server'
import { Order } from '@/lib/types'

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
        design: {
          templateId: 'bunny-baby-pink',
          color: '#FFC0CB',
          accessories: [],
          engrave: {
            text: 'Bé Minh',
            font: 'Sans',
            position: 'center',
          },
          unitPrice: 400000,
        },
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
        design: {
          templateId: 'bunny-lavender',
          color: '#E6E6FA',
          accessories: [],
          engrave: {
            text: 'Baby Anh',
            font: 'Sans',
            position: 'center',
          },
          unitPrice: 400000,
        },
        qty: 1,
      },
      {
        design: {
          templateId: 'necklace-baby-pink',
          color: '#FFC0CB',
          accessories: [],
          engrave: null,
          unitPrice: 150000,
        },
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
        design: {
          templateId: 'clip-pink',
          color: '#FFB6C1',
          accessories: [],
          engrave: null,
          unitPrice: 100000,
        },
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
        design: {
          templateId: 'bunny-yellow',
          color: '#FFFF99',
          accessories: [],
          engrave: {
            text: 'Thiên Ân',
            font: 'Sans',
            position: 'center',
          },
          unitPrice: 400000,
        },
        qty: 1,
      },
      {
        design: {
          templateId: 'necklace-yellow',
          color: '#FFFF99',
          accessories: [],
          engrave: null,
          unitPrice: 150000,
        },
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
        design: {
          templateId: 'bunny-mint',
          color: '#98FF98',
          accessories: [],
          engrave: {
            text: 'Gia Bảo',
            font: 'Sans',
            position: 'center',
          },
          unitPrice: 400000,
        },
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
        design: {
          templateId: 'necklace-lavender',
          color: '#E6E6FA',
          accessories: [],
          engrave: null,
          unitPrice: 150000,
        },
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
        design: {
          templateId: 'clip-baby-pink',
          color: '#FFB6C1',
          accessories: [],
          engrave: null,
          unitPrice: 100000,
        },
        qty: 2,
      },
      {
        design: {
          templateId: 'clip-lavender',
          color: '#E6E6FA',
          accessories: [],
          engrave: null,
          unitPrice: 100000,
        },
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
        design: {
          templateId: 'bunny-pink',
          color: '#FFB6C1',
          accessories: [],
          engrave: {
            text: 'Phương Anh',
            font: 'Sans',
            position: 'center',
          },
          unitPrice: 400000,
        },
        qty: 1,
      },
      {
        design: {
          templateId: 'necklace-pink',
          color: '#FFB6C1',
          accessories: [],
          engrave: null,
          unitPrice: 150000,
        },
        qty: 1,
      },
      {
        design: {
          templateId: 'clip-pink',
          color: '#FFB6C1',
          accessories: [],
          engrave: null,
          unitPrice: 100000,
        },
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
        design: {
          templateId: 'necklace-mint',
          color: '#98FF98',
          accessories: [],
          engrave: null,
          unitPrice: 150000,
        },
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
        design: {
          templateId: 'bunny-baby-pink',
          color: '#FFC0CB',
          accessories: [],
          engrave: {
            text: 'Kim Ngân',
            font: 'Sans',
            position: 'center',
          },
          unitPrice: 400000,
        },
        qty: 2,
      },
      {
        design: {
          templateId: 'clip-yellow',
          color: '#FFFF99',
          accessories: [],
          engrave: null,
          unitPrice: 100000,
        },
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

