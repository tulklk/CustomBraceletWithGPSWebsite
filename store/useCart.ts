import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, CustomDesign } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  addItem: (design: CustomDesign) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (design) => {
        const items = get().items
        const existingItem = items.find(
          (item) =>
            item.design.productId === design.productId &&
            item.design.templateId === design.templateId &&
            JSON.stringify(item.design.colors) === JSON.stringify(design.colors) &&
            JSON.stringify(item.design.accessories) === JSON.stringify(design.accessories) &&
            JSON.stringify(item.design.engrave) === JSON.stringify(design.engrave)
        )

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === existingItem.id
                ? { ...item, qty: item.qty + 1 }
                : item
            ),
          })
        } else {
          const newItem: CartItem = {
            id: `${Date.now()}-${Math.random()}`,
            design,
            qty: 1,
          }
          set({ items: [...items, newItem] })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, qty } : item
            ),
          })
        }
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.design.unitPrice * item.qty,
          0
        )
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0)
      },
    }),
    {
      name: 'artemis-cart',
    }
  )
)

