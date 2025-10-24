import { NextResponse } from 'next/server'
import { Accessory } from '@/lib/types'

const MOCK_ACCESSORIES: Accessory[] = [
  {
    id: 'star',
    name: 'Ngôi sao',
    price: 50000,
    icon: '⭐',
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
    id: 'bear',
    name: 'Gấu',
    price: 80000,
    icon: '🧸',
    compatiblePositions: ['top', 'bottom'],
  },
  {
    id: 'robot',
    name: 'Robot',
    price: 80000,
    icon: '🤖',
    compatiblePositions: ['top', 'bottom'],
  },
  {
    id: 'unicorn',
    name: 'Kỳ lân',
    price: 100000,
    icon: '🦄',
    compatiblePositions: ['top'],
  },
  {
    id: 'soccer',
    name: 'Bóng đá',
    price: 60000,
    icon: '⚽',
    compatiblePositions: ['left', 'right', 'bottom'],
  },
  {
    id: 'rocket',
    name: 'Tên lửa',
    price: 90000,
    icon: '🚀',
    compatiblePositions: ['top', 'left', 'right'],
  },
  {
    id: 'planet',
    name: 'Hành tinh',
    price: 70000,
    icon: '🪐',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'dolphin',
    name: 'Cá heo',
    price: 85000,
    icon: '🐬',
    compatiblePositions: ['left', 'right'],
  },
  {
    id: 'shell',
    name: 'Vỏ sò',
    price: 55000,
    icon: '🐚',
    compatiblePositions: ['top', 'left', 'right', 'bottom'],
  },
  {
    id: 'crown',
    name: 'Vương miện',
    price: 120000,
    icon: '👑',
    compatiblePositions: ['top'],
  },
  {
    id: 'lightning',
    name: 'Tia chớp',
    price: 60000,
    icon: '⚡',
    compatiblePositions: ['left', 'right'],
  },
]

export async function GET() {
  return NextResponse.json(MOCK_ACCESSORIES)
}

