import { NextResponse } from 'next/server'
import { Template } from '@/lib/types'

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'bunny-baby-pink',
    name: 'Bunny Baby Pink',
    basePrice: 400000,
    defaultColors: {
      band: 'pink',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['heart', 'flower', 'bunny'],
    preview: '/images/templates/bunny-baby-pink.png',
    description: 'Thỏ hồng đáng yêu với họa tiết hoa và tim, dành cho bé gái năng động',
  },
  {
    id: 'bunny-lavender',
    name: 'Bunny Lavender',
    basePrice: 400000,
    defaultColors: {
      band: 'purple',
      face: 'white',
      rim: 'purple',
    },
    recommendedAccessories: ['star', 'circle', 'bunny'],
    preview: '/images/templates/bunny-lavender.png',
    description: 'Thỏ tím pastel với họa tiết chấm tròn đầy màu sắc, dễ thương và sáng tạo',
  },
  {
    id: 'bunny-yellow',
    name: 'Bunny Yellow',
    basePrice: 400000,
    defaultColors: {
      band: 'yellow',
      face: 'white',
      rim: 'orange',
    },
    recommendedAccessories: ['carrot', 'leaf', 'bunny'],
    preview: '/images/templates/bunny-yellow.png',
    description: 'Thỏ vàng tươi với cà rốt và lá, năng lượng tích cực cho bé',
  },
  {
    id: 'bunny-mint',
    name: 'Bunny Mint',
    basePrice: 400000,
    defaultColors: {
      band: 'green',
      face: 'white',
      rim: 'green',
    },
    recommendedAccessories: ['leaf', 'flower', 'bunny'],
    preview: '/images/templates/bunny-mint.png',
    description: 'Thỏ xanh mint tươi mát với họa tiết lá và hoa, thanh lịch và dịu dàng',
  },
  {
    id: 'bunny-pink',
    name: 'Bunny Green',
    basePrice: 400000,
    defaultColors: {
      band: 'pink',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['bunny', 'heart'],
    preview: '/images/templates/bunny-pink.png',
    description: 'Thỏ hồng pastel đơn giản, nhẹ nhàng và dễ thương nhất',
  },
]

export async function GET() {
  return NextResponse.json(MOCK_TEMPLATES)
}

