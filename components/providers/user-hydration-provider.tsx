'use client'

import { useEffect } from 'react'
import { useUser } from '@/store/useUser'

/**
 * Hydrate user store from localStorage on client mount
 * This ensures user data persists across page reloads
 */
export function UserHydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // On client mount, restore user from localStorage if not already set
    const { user } = useUser.getState()
    
    if (!user) {
      try {
        const savedUser = localStorage.getItem('artemis-user-data')
        if (savedUser) {
          const userFromStorage = JSON.parse(savedUser)
          // Update store with restored user
          useUser.setState({ user: userFromStorage })
          console.log('[UserHydration] Restored user from localStorage:', userFromStorage.email)
        }
      } catch (error) {
        console.error('[UserHydration] Failed to restore user:', error)
      }
    }
  }, [])

  return <>{children}</>
}
