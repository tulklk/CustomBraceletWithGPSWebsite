import { NextResponse } from 'next/server'
import { Accessory } from '@/lib/types'

const MOCK_ACCESSORIES: Accessory[] = [
  {
    id: 'bunny',
    name: 'Thỏ',
    price: 80000,
    icon: '🐰',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'heart',
    name: 'Trái tim',
    price: 50000,
    icon: '❤️',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'flower',
    name: 'Hoa',
    price: 55000,
    icon: '🌸',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'carrot',
    name: 'Cà rốt',
    price: 60000,
    icon: '🥕',
    compatiblePositions: ['left', 'right', 'bottom'],
  },
  {
    id: 'leaf',
    name: 'Lá cây',
    price: 50000,
    icon: '🍃',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'star',
    name: 'Ngôi sao',
    price: 50000,
    icon: '⭐',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'circle',
    name: 'Chấm tròn',
    price: 45000,
    icon: '⚪',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'bow',
    name: 'Nơ',
    price: 70000,
    icon: '🎀',
    compatiblePositions: ['top', 'left', 'right'],
  },
  {
    id: 'butterfly',
    name: 'Bướm',
    price: 75000,
    icon: '🦋',
    compatiblePositions: ['top', 'left', 'right'],
  },
  {
    id: 'crown',
    name: 'Vương miện',
    price: 120000,
    icon: '👑',
    compatiblePositions: ['top'],
  },
  {
    id: 'rainbow',
    name: 'Cầu vồng',
    price: 90000,
    icon: '🌈',
    compatiblePositions: ['top', 'left', 'right'],
  },
  {
    id: 'cherry',
    name: 'Cherry',
    price: 65000,
    icon: '🍒',
    compatiblePositions: ['left', 'right', 'bottom'],
  },
]

export async function GET() {
  return NextResponse.json(MOCK_ACCESSORIES)
}

