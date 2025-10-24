import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, CustomDesign } from '@/lib/types'

interface UserStore {
  user: User | null
  login: (email: string, name: string) => void
  logout: () => void
  saveDesign: (design: CustomDesign) => void
  removeDesign: (index: number) => void
}

export const useUser = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,

      login: (email, name) => {
        set({
          user: {
            id: `user-${Date.now()}`,
            email,
            name,
            savedDesigns: [],
          },
        })
      },

      logout: () => {
        set({ user: null })
      },

      saveDesign: (design) => {
        const user = get().user
        if (!user) return

        set({
          user: {
            ...user,
            savedDesigns: [...user.savedDesigns, design],
          },
        })
      },

      removeDesign: (index) => {
        const user = get().user
        if (!user) return

        set({
          user: {
            ...user,
            savedDesigns: user.savedDesigns.filter((_, i) => i !== index),
          },
        })
      },
    }),
    {
      name: 'artemis-user',
    }
  )
)

