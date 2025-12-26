import { API_BASE_URL } from "@/lib/constants"
import { handleResponse, createAuthHeaders, ApiError } from "./auth"
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "@/types/user"

/**
 * Get current user profile
 */
export async function getMyProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/Users/me`, {
    method: "GET",
    headers: createAuthHeaders(token),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login again")
    }
    if (response.status === 404) {
      throw new Error("User not found")
    }
    const errorData: ApiError = await response.json().catch(() => ({
      message: "Unknown error",
      statusCode: response.status,
    }))
    throw new Error(errorData.message || `Failed to fetch profile: ${response.statusText}`)
  }

  return handleResponse<UserProfile>(response)
}

/**
 * Update current user profile
 */
export async function updateMyProfile(
  data: UpdateProfileRequest,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/Users/me`, {
    method: "PUT",
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login again")
    }
    if (response.status === 400) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: "Invalid request data",
        statusCode: 400,
      }))
      throw new Error(errorData.message || "Invalid request data")
    }
    const errorData: ApiError = await response.json().catch(() => ({
      message: "Unknown error",
      statusCode: response.status,
    }))
    throw new Error(errorData.message || `Failed to update profile: ${response.statusText}`)
  }
}

/**
 * Change password
 */
export async function changePassword(
  data: ChangePasswordRequest,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/Users/me/change-password`, {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login again")
    }
    if (response.status === 400) {
      const errorData: ApiError = await response.json().catch(() => ({
        message: "Current password is incorrect",
        statusCode: 400,
      }))
      throw new Error(errorData.message || "Current password is incorrect")
    }
    const errorData: ApiError = await response.json().catch(() => ({
      message: "Unknown error",
      statusCode: response.status,
    }))
    throw new Error(errorData.message || `Failed to change password: ${response.statusText}`)
  }
}

