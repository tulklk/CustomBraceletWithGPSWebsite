import { NextResponse } from 'next/server'
import { Template } from '@/lib/types'

const MOCK_TEMPLATES: Template[] = [
  // Vòng tay Bunny
  {
    id: 'bunny-baby-pink',
    name: 'Bunny Baby Pink',
    basePrice: 400000,
    defaultColors: {
      band: '#FFC0CB',
      face: '#FFFFFF',
      rim: '#FFB6C1',
    },
    recommendedAccessories: ['heart', 'flower', 'bunny'],
    preview: '/images/templates/bunny-baby-pink.png',
    description: 'Thỏ hồng đáng yêu với họa tiết hoa và tim, dành cho bé gái năng động',
  },
  {
    id: 'bunny-pink',
    name: 'Bunny Pink',
    basePrice: 400000,
    defaultColors: {
      band: '#FFB6C1',
      face: '#FFFFFF',
      rim: '#FF69B4',
    },
    recommendedAccessories: ['bunny', 'heart'],
    preview: '/images/templates/bunny-pink.png',
    description: 'Thỏ hồng pastel đơn giản, nhẹ nhàng và dễ thương nhất',
  },
  {
    id: 'bunny-lavender',
    name: 'Bunny Lavender',
    basePrice: 400000,
    defaultColors: {
      band: '#E6E6FA',
      face: '#FFFFFF',
      rim: '#DDA0DD',
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
      band: '#FFFF99',
      face: '#FFFFFF',
      rim: '#FFD700',
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
      band: '#98FF98',
      face: '#FFFFFF',
      rim: '#90EE90',
    },
    recommendedAccessories: ['leaf', 'flower', 'bunny'],
    preview: '/images/templates/bunny-mint.png',
    description: 'Thỏ xanh mint tươi mát với họa tiết lá và hoa, thanh lịch và dịu dàng',
  },
  
  // Dây chuyền
  {
    id: 'necklace-baby-pink',
    name: 'Dây Chuyền Baby Pink',
    basePrice: 150000,
    defaultColors: {
      band: '#FFC0CB',
      face: '#FFFFFF',
      rim: '#FFB6C1',
    },
    recommendedAccessories: [],
    preview: '/images/necklaces/necklace-baby-pink.png',
    description: 'Dây chuyền màu hồng baby nhẹ nhàng, phù hợp với mọi trang phục',
  },
  {
    id: 'necklace-pink',
    name: 'Dây Chuyền Pink',
    basePrice: 150000,
    defaultColors: {
      band: '#FFB6C1',
      face: '#FFFFFF',
      rim: '#FF69B4',
    },
    recommendedAccessories: [],
    preview: '/images/necklaces/necklace-pink.png',
    description: 'Dây chuyền hồng tươi trẻ trung, năng động',
  },
  {
    id: 'necklace-lavender',
    name: 'Dây Chuyền Lavender',
    basePrice: 150000,
    defaultColors: {
      band: '#E6E6FA',
      face: '#FFFFFF',
      rim: '#DDA0DD',
    },
    recommendedAccessories: [],
    preview: '/images/necklaces/necklace-lavender.png',
    description: 'Dây chuyền màu tím lavender thanh lịch, sang trọng',
  },
  {
    id: 'necklace-yellow',
    name: 'Dây Chuyền Yellow',
    basePrice: 150000,
    defaultColors: {
      band: '#FFFF99',
      face: '#FFFFFF',
      rim: '#FFD700',
    },
    recommendedAccessories: [],
    preview: '/images/necklaces/necklace-yellow.png',
    description: 'Dây chuyền vàng tươi vui tươi, tràn đầy năng lượng',
  },
  {
    id: 'necklace-mint',
    name: 'Dây Chuyền Mint',
    basePrice: 150000,
    defaultColors: {
      band: '#98FF98',
      face: '#FFFFFF',
      rim: '#90EE90',
    },
    recommendedAccessories: [],
    preview: '/images/necklaces/necklace-mint.png',
    description: 'Dây chuyền xanh mint tươi mát, dễ chịu',
  },
  
  // Pin kẹp quần áo
  {
    id: 'clip-baby-pink',
    name: 'Pin Kẹp Baby Pink',
    basePrice: 100000,
    defaultColors: {
      band: '#FFC0CB',
      face: '#FFFFFF',
      rim: '#FFB6C1',
    },
    recommendedAccessories: [],
    preview: '/images/clips/clip-baby-pink.png',
    description: 'Pin kẹp quần áo màu hồng baby, tiện dụng và dễ thương',
  },
  {
    id: 'clip-pink',
    name: 'Pin Kẹp Pink',
    basePrice: 100000,
    defaultColors: {
      band: '#FFB6C1',
      face: '#FFFFFF',
      rim: '#FF69B4',
    },
    recommendedAccessories: [],
    preview: '/images/clips/clip-pink.png',
    description: 'Pin kẹp quần áo màu hồng tươi, dễ sử dụng',
  },
  {
    id: 'clip-lavender',
    name: 'Pin Kẹp Lavender',
    basePrice: 100000,
    defaultColors: {
      band: '#E6E6FA',
      face: '#FFFFFF',
      rim: '#DDA0DD',
    },
    recommendedAccessories: [],
    preview: '/images/clips/clip-lavender.png',
    description: 'Pin kẹp quần áo màu tím lavender, thanh lịch',
  },
  {
    id: 'clip-yellow',
    name: 'Pin Kẹp Yellow',
    basePrice: 100000,
    defaultColors: {
      band: '#FFFF99',
      face: '#FFFFFF',
      rim: '#FFD700',
    },
    recommendedAccessories: [],
    preview: '/images/clips/clip-yellow.png',
    description: 'Pin kẹp quần áo màu vàng, nổi bật và dễ nhận diện',
  },
]

export async function GET() {
  return NextResponse.json(MOCK_TEMPLATES)
}

