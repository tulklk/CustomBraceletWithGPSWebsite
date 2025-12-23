import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, CustomDesign, AuthResponse } from '@/lib/types'
import { authApi } from '@/lib/api/auth'

interface UserStore {
  user: User | null
  // Legacy login for backward compatibility (deprecated)
  login: (email: string, name: string) => void
  // New auth methods
  setAuth: (authResponse: AuthResponse) => void
  logout: () => Promise<void>
  saveDesign: (design: CustomDesign) => void
  removeDesign: (index: number) => void
  refreshAccessToken: () => Promise<void>
}

export const useUser = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,

      // Legacy login - kept for backward compatibility but should use setAuth instead
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

      // Set authentication data from API response
      setAuth: (authResponse: AuthResponse) => {
        const { user: backendUser, accessToken, refreshToken } = authResponse
        
        set({
          user: {
            id: backendUser.id,
            email: backendUser.email,
            name: backendUser.fullName,
            fullName: backendUser.fullName,
            phoneNumber: backendUser.phoneNumber,
            avatar: backendUser.avatar,
            role: backendUser.role,
            emailVerified: backendUser.emailVerified,
            accessToken,
            refreshToken,
            savedDesigns: get().user?.savedDesigns || [],
          },
        })
      },

      // Logout - calls API and clears local state
      logout: async () => {
        const user = get().user
        if (user?.accessToken) {
          try {
            await authApi.logout(user.accessToken)
          } catch (error) {
            // Even if API call fails, we still want to clear local state
            console.warn("Logout API call failed:", error)
          }
        }
        set({ user: null })
      },

      // Refresh access token using refresh token
      refreshAccessToken: async () => {
        const user = get().user
        if (!user?.refreshToken) {
          throw new Error("No refresh token available")
        }

        try {
          const authResponse = await authApi.refreshToken({
            refreshToken: user.refreshToken,
          })
          get().setAuth(authResponse)
        } catch (error) {
          // If refresh fails, logout the user
          console.error("Failed to refresh token:", error)
          await get().logout()
          throw error
        }
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

