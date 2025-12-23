import { API_BASE_URL } from "@/lib/constants"
import { AuthResponse, BackendUser } from "@/lib/types"

// Register Request
export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
}

// Login Request
export interface LoginRequest {
  email: string
  password: string
}

// Refresh Token Request
export interface RefreshTokenRequest {
  refreshToken: string
}

// Forgot Password Request
export interface ForgotPasswordRequest {
  email: string
}

// Verify Email Request
export interface VerifyEmailRequest {
  token: string
}

// Google Login Request (backend requires idToken)
export interface GoogleLoginRequest {
  idToken: string
}

// API Error Response
export interface ApiError {
  message: string
  statusCode?: number
  errors?: Record<string, string[]>
}

// Helper function to handle API responses
export async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")
  const isJson = contentType && contentType.includes("application/json")
  
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const error: ApiError = isJson 
      ? (data as ApiError)
      : { message: data || `HTTP error! status: ${response.status}` }
    error.statusCode = response.status
    throw error
  }

  return data as T
}

/**
 * Create headers for authenticated API requests
 */
export function createAuthHeaders(accessToken: string, additionalHeaders?: HeadersInit): HeadersInit {
  return {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "accept": "*/*",
    ...additionalHeaders,
  }
}

/**
 * Create headers for unauthenticated API requests
 */
export function createHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    "accept": "*/*",
    ...additionalHeaders,
  }
}

// Auth API Service
export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<AuthResponse>(response)
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<AuthResponse>(response)
  },

  /**
   * Login with Google
   */
  async loginWithGoogle(data: GoogleLoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/login/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<AuthResponse>(response)
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<AuthResponse>(response)
  },

  /**
   * Get current user information
   */
  async getMe(accessToken: string): Promise<BackendUser> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/me`, {
      method: "GET",
      headers: createAuthHeaders(accessToken),
    })

    return handleResponse<BackendUser>(response)
  },

  /**
   * Logout (invalidate refresh token)
   */
  async logout(accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/logout`, {
      method: "POST",
      headers: createAuthHeaders(accessToken),
    })

    if (!response.ok) {
      // Logout might fail if token is already invalid, but we still want to clear local state
      console.warn("Logout API call failed, but clearing local state anyway")
    }
  },

  /**
   * Verify email address
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<void>(response)
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify({ email }),
    })

    return handleResponse<void>(response)
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<void>(response)
  },
}

