import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, CustomDesign } from '@/lib/types'
import { cartApi, BackendCartItem } from '@/lib/api/cart'

interface CartStore {
  items: CartItem[]
  isLoading: boolean
  isSyncing: boolean
  addItem: (design: CustomDesign) => void
  addItemByProductId: (productId: string, quantity: number, engravingText?: string | null) => Promise<void>
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
  fetchCart: () => Promise<void>
  syncCart: () => Promise<void>
}

// Helper to map backend cart item to frontend CartItem
function mapBackendCartItem(backendItem: BackendCartItem): CartItem {
  // Create a minimal design object from backend cart item
  // This is a simplified design since backend doesn't store full design info
  const design: CustomDesign = {
    productId: backendItem.productId,
    templateId: '', // Backend doesn't store template info
    colors: {
      band: '#FFFFFF',
      face: '#FFFFFF',
      rim: '#FFFFFF',
    },
    accessories: [],
    unitPrice: backendItem.unitPrice,
    // Map engraving text from backend if available
    engrave: backendItem.engravingText?.trim() ? {
      text: backendItem.engravingText.trim(),
      font: "Sans",
      position: "inside",
    } : undefined,
  }

  return {
    id: backendItem.id,
    design,
    qty: backendItem.quantity,
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,
      
      // Add item with custom design (for customizer products)
      addItem: async (design) => {
        // For authenticated users, try to sync with backend
        const userStore = await import('./useUser').then(m => m.useUser.getState())
        const user = userStore.user
        
        if (user?.accessToken) {
          try {
            set({ isSyncing: true })
            // For custom designs, we still use local storage
            // Backend API only supports productId + quantity
            // So we'll keep custom designs in local storage
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
          } catch (error) {
            console.error("Error adding item to cart:", error)
            // Fallback to local storage
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
          } finally {
            set({ isSyncing: false })
          }
        } else {
          // Guest user - use local storage only
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
        }
      },

      // Add item by product ID (for regular products without customizer)
      addItemByProductId: async (productId: string, quantity: number, engravingText?: string | null) => {
        const userStore = await import('./useUser').then(m => m.useUser.getState())
        const user = userStore.user
        
        if (user?.accessToken && user.refreshToken) {
          try {
            set({ isSyncing: true })
            await userStore.makeAuthenticatedRequest(async (token) => {
              await cartApi.addItem(
                { productId, quantity, engravingText: engravingText?.trim() || null },
                token,
                user.refreshToken,
                (newToken) => {
                  userStore.setAuth({
                    ...user,
                    accessToken: newToken,
                  } as any)
                }
              )
            })
            
            // Fetch updated cart from backend
            await get().fetchCart()
          } catch (error) {
            console.error("Error adding item to cart:", error)
            throw error
          } finally {
            set({ isSyncing: false })
          }
        } else {
          // Guest user - use local storage
          // Create a minimal design for guest users
          const design: CustomDesign = {
            productId,
            templateId: '',
            colors: {
              band: '#FFFFFF',
              face: '#FFFFFF',
              rim: '#FFFFFF',
            },
            accessories: [],
            unitPrice: 0, // Will need to fetch from product
            // Add engraving text if provided
            engrave: engravingText?.trim() ? {
              text: engravingText.trim(),
              font: "Sans",
              position: "inside",
            } : undefined,
          }
          
          const items = get().items
          // Check for existing item with same productId, templateId, and engraving text
          const existingItem = items.find(
            (item) => 
              item.design.productId === productId && 
              !item.design.templateId &&
              item.design.engrave?.text === design.engrave?.text
          )

          if (existingItem) {
            set({
              items: items.map((item) =>
                item.id === existingItem.id
                  ? { ...item, qty: item.qty + quantity }
                  : item
              ),
            })
          } else {
            const newItem: CartItem = {
              id: `${Date.now()}-${Math.random()}`,
              design,
              qty: quantity,
            }
            set({ items: [...items, newItem] })
          }
        }
      },

      removeItem: async (id: string) => {
        const userStore = await import('./useUser').then(m => m.useUser.getState())
        const user = userStore.user
        
        if (user?.accessToken && user.refreshToken) {
          try {
            set({ isSyncing: true })
            // Check if this is a backend cart item (has UUID format)
            const item = get().items.find(item => item.id === id)
            if (item && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)) {
              // It's a backend cart item, delete from backend
              await userStore.makeAuthenticatedRequest(async (token) => {
                await cartApi.removeItem(
                  id,
                  token,
                  user.refreshToken,
                  (newToken) => {
                    userStore.setAuth({
                      ...user,
                      accessToken: newToken,
                    } as any)
                  }
                )
              })
              // Fetch updated cart
              await get().fetchCart()
            } else {
              // Local item, just remove from local storage
              set({ items: get().items.filter((item) => item.id !== id) })
            }
          } catch (error) {
            console.error("Error removing item from cart:", error)
            // Fallback to local removal
            set({ items: get().items.filter((item) => item.id !== id) })
          } finally {
            set({ isSyncing: false })
          }
        } else {
          // Guest user - use local storage
          set({ items: get().items.filter((item) => item.id !== id) })
        }
      },

      updateQuantity: async (id: string, qty: number) => {
        if (qty <= 0) {
          await get().removeItem(id)
          return
        }

        const userStore = await import('./useUser').then(m => m.useUser.getState())
        const user = userStore.user
        
        if (user?.accessToken && user.refreshToken) {
          try {
            set({ isSyncing: true })
            // Check if this is a backend cart item
            const item = get().items.find(item => item.id === id)
            if (item && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)) {
              // It's a backend cart item, update on backend
              await userStore.makeAuthenticatedRequest(async (token) => {
                await cartApi.updateItem(
                  id,
                  { quantity: qty },
                  token,
                  user.refreshToken,
                  (newToken) => {
                    userStore.setAuth({
                      ...user,
                      accessToken: newToken,
                    } as any)
                  }
                )
              })
              // Fetch updated cart
              await get().fetchCart()
            } else {
              // Local item, update in local storage
              set({
                items: get().items.map((item) =>
                  item.id === id ? { ...item, qty } : item
                ),
              })
            }
          } catch (error) {
            console.error("Error updating cart item quantity:", error)
            // Fallback to local update
            set({
              items: get().items.map((item) =>
                item.id === id ? { ...item, qty } : item
              ),
            })
          } finally {
            set({ isSyncing: false })
          }
        } else {
          // Guest user - use local storage
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, qty } : item
            ),
          })
        }
      },

      clearCart: async () => {
        const userStore = await import('./useUser').then(m => m.useUser.getState())
        const user = userStore.user
        
        if (user?.accessToken && user.refreshToken) {
          try {
            set({ isSyncing: true })
            await userStore.makeAuthenticatedRequest(async (token) => {
              await cartApi.clearCart(
                token,
                user.refreshToken,
                (newToken) => {
                  userStore.setAuth({
                    ...user,
                    accessToken: newToken,
                  } as any)
                }
              )
            })
            set({ items: [] })
          } catch (error) {
            console.error("Error clearing cart:", error)
            set({ items: [] })
          } finally {
            set({ isSyncing: false })
          }
        } else {
          // Guest user - use local storage
          set({ items: [] })
        }
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.design.unitPrice || 0) * item.qty,
          0
        )
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0)
      },

      // Fetch cart from backend
      fetchCart: async () => {
        const userStore = await import('./useUser').then(m => m.useUser.getState())
        const user = userStore.user
        
        if (!user?.accessToken) {
          return // Guest user, skip
        }

        try {
          set({ isLoading: true })
          const cart = await userStore.makeAuthenticatedRequest(async (token) => {
            return await cartApi.getCart(
              token,
              user.refreshToken,
              (newToken) => {
                userStore.setAuth({
                  ...user,
                  accessToken: newToken,
                } as any)
              }
            )
          })

          // Map backend cart items to frontend format
          const mappedItems = cart.items.map(mapBackendCartItem)
          
          // Merge with local custom design items (items with templateId)
          const localItems = get().items.filter(item => item.design.templateId)
          
          set({ items: [...mappedItems, ...localItems] })
        } catch (error) {
          console.error("Error fetching cart:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Sync local cart with backend (merge strategy)
      syncCart: async () => {
        await get().fetchCart()
      },
    }),
    {
      name: 'artemis-cart',
    }
  )
)

