import { create } from 'zustand'
import { User, AuthResponse } from '@/lib/types'
import { authApi } from '@/lib/api/auth'

interface UserStore {
  user: User | null
  setAuth: (authResponse: AuthResponse) => void
  logout: () => void
  makeAuthenticatedRequest: <T>(request: (token: string) => Promise<T>) => Promise<T>
}

// Helper functions for localStorage
export const getLocalAuth = () => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('artemis_admin_auth')
  return data ? JSON.parse(data) : null
}

export const setLocalAuth = (data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('artemis_admin_auth', JSON.stringify(data))
  }
}

export const removeLocalAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('artemis_admin_auth')
  }
}

export const useUser = create<UserStore>((set, get) => {
  // Sync initialization from localStorage
  const auth = getLocalAuth();
  const initialUser = auth?.user ? {
    ...auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken
  } : null;

  return {
    user: initialUser,

    setAuth: (authResponse: AuthResponse) => {
      const { user: backendUser, accessToken, refreshToken } = authResponse;
      const frontendUser: User = {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.fullName,
        fullName: backendUser.fullName,
        phoneNumber: backendUser.phoneNumber,
        avatar: backendUser.avatar,
        role: backendUser.role,
        emailVerified: backendUser.emailVerified,
        savedDesigns: [],
        accessToken,
        refreshToken,
      };

      const authData = {
        user: frontendUser,
        accessToken,
        refreshToken
      };

      setLocalAuth(authData);
      set({ user: frontendUser });
    },

    logout: () => {
      removeLocalAuth();
      set({ user: null });
    },

    makeAuthenticatedRequest: async <T>(
      request: (token: string) => Promise<T>
    ): Promise<T> => {
      const { user } = get()
      if (!user?.accessToken) {
        throw new Error("No access token available")
      }

      try {
        return await request(user.accessToken)
      } catch (error: any) {
        // If 401 Unauthorized, try to refresh token
        if (error.statusCode === 401 && user.refreshToken) {
          try {
            const refreshResponse = await authApi.refreshToken({
              refreshToken: user.refreshToken,
            })

            // Update auth state with new token
            const { setAuth } = get()
            setAuth(refreshResponse)

            // Retry the original request with new token
            return await request(refreshResponse.accessToken)
          } catch (refreshError) {
            // Refresh failed, logout user
            const { logout } = get()
            logout()
            throw refreshError
          }
        }
        throw error
      }
    },
  };
});
