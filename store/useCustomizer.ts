import { create } from 'zustand'
import { CustomDesign, Engrave } from '@/lib/types'
import { ENGRAVE_FEE } from '@/lib/constants'

interface CustomizerStore {
  productId: string
  templateId: string
  basePrice: number
  colors: { band: string; face: string; rim: string }
  accessories: { accessoryId: string; position: 'top' | 'left' | 'right' | 'bottom' }[]
  engrave?: Engrave
  accessoriesPrices: Record<string, number>

  setProduct: (productId: string) => void
  setTemplate: (templateId: string, basePrice: number, defaultColors: { band: string; face: string; rim: string }) => void
  setColor: (part: 'band' | 'face' | 'rim', colorId: string) => void
  addAccessory: (accessoryId: string, position: 'top' | 'left' | 'right' | 'bottom', price: number) => void
  removeAccessory: (accessoryId: string) => void
  setEngrave: (engrave?: Engrave) => void
  getUnitPrice: () => number
  getDesign: () => CustomDesign
  reset: () => void
}

export const useCustomizer = create<CustomizerStore>((set, get) => ({
  productId: '',
  templateId: '',
  basePrice: 0,
  colors: { band: 'blue', face: 'white', rim: 'blue' },
  accessories: [],
  engrave: undefined,
  accessoriesPrices: {},

  setProduct: (productId) => {
    set({ productId })
  },

  setTemplate: (templateId, basePrice, defaultColors) => {
    set({ templateId, basePrice, colors: defaultColors, accessories: [], engrave: undefined })
  },

  setColor: (part, colorId) => {
    set((state) => ({
      colors: { ...state.colors, [part]: colorId },
    }))
  },

  addAccessory: (accessoryId, position, price) => {
    const state = get()
    // Remove any existing accessory at this position
    const filtered = state.accessories.filter((a) => a.position !== position)
    set({
      accessories: [...filtered, { accessoryId, position }],
      accessoriesPrices: { ...state.accessoriesPrices, [accessoryId]: price },
    })
  },

  removeAccessory: (accessoryId) => {
    set((state) => ({
      accessories: state.accessories.filter((a) => a.accessoryId !== accessoryId),
    }))
  },

  setEngrave: (engrave) => {
    set({ engrave })
  },

  getUnitPrice: () => {
    const state = get()
    const accessoriesTotal = state.accessories.reduce(
      (sum, acc) => sum + (state.accessoriesPrices[acc.accessoryId] || 0),
      0
    )
    const engravePrice = state.engrave ? ENGRAVE_FEE : 0
    return state.basePrice + accessoriesTotal + engravePrice
  },

  getDesign: () => {
    const state = get()
    return {
      productId: state.productId,
      templateId: state.templateId,
      colors: state.colors,
      accessories: state.accessories,
      engrave: state.engrave,
      unitPrice: state.getUnitPrice(),
    }
  },

  reset: () => {
    set({
      productId: '',
      templateId: '',
      basePrice: 0,
      colors: { band: 'blue', face: 'white', rim: 'blue' },
      accessories: [],
      engrave: undefined,
      accessoriesPrices: {},
    })
  },
}))

