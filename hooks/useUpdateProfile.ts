import { useState } from "react"
import { UpdateProfileRequest } from "@/types/user"
import { updateMyProfile } from "@/lib/api/user"
import { useUser } from "@/store/useUser"

export function useUpdateProfile() {
  const { user, makeAuthenticatedRequest } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    if (!user?.accessToken) {
      setError("No authentication token")
      return false
    }

    setLoading(true)
    setError(null)

    try {
      await makeAuthenticatedRequest(async (token) => {
        return await updateMyProfile(data, token)
      })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateProfile, loading, error }
}

