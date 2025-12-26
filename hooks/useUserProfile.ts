import { useState, useEffect } from "react"
import { UserProfile } from "@/types/user"
import { getMyProfile } from "@/lib/api/user"
import { useUser } from "@/store/useUser"

export function useUserProfile() {
  const { user, makeAuthenticatedRequest } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!user?.accessToken) {
      setError("No authentication token")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await makeAuthenticatedRequest(async (token) => {
        return await getMyProfile(token)
      })
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.accessToken) {
      fetchProfile()
    }
  }, [user?.accessToken])

  return { profile, loading, error, refetch: fetchProfile }
}

