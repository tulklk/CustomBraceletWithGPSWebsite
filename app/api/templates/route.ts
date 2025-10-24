import { NextResponse } from 'next/server'
import { Template } from '@/lib/types'

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'sport',
    name: 'Sport',
    basePrice: 1200000,
    defaultColors: {
      band: 'blue',
      face: 'white',
      rim: 'blue',
    },
    recommendedAccessories: ['star', 'soccer'],
    preview: '/images/templates/sport.svg',
    description: 'Phong cách thể thao năng động, phù hợp với trẻ năng động',
  },
  {
    id: 'cute',
    name: 'Cute',
    basePrice: 1200000,
    defaultColors: {
      band: 'pink',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['heart', 'bear', 'unicorn'],
    preview: '/images/templates/cute.svg',
    description: 'Thiết kế dễ thương, ngọt ngào cho bé gái',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    basePrice: 1400000,
    defaultColors: {
      band: 'purple',
      face: 'black',
      rim: 'cyan',
    },
    recommendedAccessories: ['star', 'rocket', 'planet'],
    preview: '/images/templates/galaxy.svg',
    description: 'Chủ đề vũ trụ huyền bí, kích thích trí tưởng tượng',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    basePrice: 1100000,
    defaultColors: {
      band: 'black',
      face: 'white',
      rim: 'gray',
    },
    recommendedAccessories: [],
    preview: '/images/templates/minimal.svg',
    description: 'Thiết kế tối giản, thanh lịch, phù hợp mọi lứa tuổi',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    basePrice: 1300000,
    defaultColors: {
      band: 'cyan',
      face: 'white',
      rim: 'blue',
    },
    recommendedAccessories: ['dolphin', 'shell'],
    preview: '/images/templates/ocean.svg',
    description: 'Chủ đề đại dương tươi mát, năng động',
  },
  {
    id: 'dino',
    name: 'Dinosaur',
    basePrice: 1250000,
    defaultColors: {
      band: 'green',
      face: 'white',
      rim: 'green',
    },
    recommendedAccessories: ['dino', 'egg'],
    preview: '/images/templates/dino.svg',
    description: 'Khủng long đáng yêu cho bé thích khám phá',
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    basePrice: 1350000,
    defaultColors: {
      band: 'purple',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['unicorn', 'rainbow', 'star'],
    preview: '/images/templates/unicorn.svg',
    description: 'Kỳ lân thần tiên, lung linh sắc màu',
  },
]

export async function GET() {
  return NextResponse.json(MOCK_TEMPLATES)
}

