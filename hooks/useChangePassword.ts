import { useState } from "react"
import { ChangePasswordRequest } from "@/types/user"
import { changePassword } from "@/lib/api/user"
import { useUser } from "@/store/useUser"

export function useChangePassword() {
  const { user, makeAuthenticatedRequest } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changePasswordHandler = async (data: ChangePasswordRequest): Promise<boolean> => {
    if (!user?.accessToken) {
      setError("No authentication token")
      return false
    }

    setLoading(true)
    setError(null)

    try {
      await makeAuthenticatedRequest(async (token) => {
        return await changePassword(data, token)
      })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { changePassword: changePasswordHandler, loading, error }
}

