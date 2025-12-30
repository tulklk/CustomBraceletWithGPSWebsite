import { API_BASE_URL } from "@/lib/constants"
import { handleResponse, fetchWithAuth, createAuthHeaders } from "./auth"

// Backend Cart Item Response Type
export interface BackendCartItem {
  id: string
  productId: string
  productName?: string
  productImage?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  engravingText?: string | null // Engraving text if product supports it
}

// Backend Cart Response Type
export interface BackendCart {
  id: string
  userId: string
  items: BackendCartItem[]
  totalAmount: number
  createdAt?: string
  updatedAt?: string
}

// Add Item to Cart Request
export interface AddCartItemRequest {
  productId: string
  quantity: number
  engravingText?: string | null
}

// Update Cart Item Request
export interface UpdateCartItemRequest {
  quantity: number
}

// Cart API Service
export const cartApi = {
  /**
   * Get current user's cart
   * Uses Next.js API proxy to bypass HTTP/2 protocol errors
   */
  async getCart(accessToken: string, refreshToken?: string, onTokenRefresh?: (newToken: string) => void): Promise<BackendCart> {
    // Use proxy route to bypass HTTP/2 errors
    const response = await fetchWithAuth("/api/cart", {
      method: "GET",
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<BackendCart>(response)
  },

  /**
   * Add item to cart
   * Uses Next.js API proxy to bypass HTTP/2 protocol errors
   */
  async addItem(
    data: AddCartItemRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<BackendCartItem> {
    // Use proxy route to bypass HTTP/2 errors
    const response = await fetchWithAuth("/api/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<BackendCartItem>(response)
  },

  /**
   * Update cart item quantity
   * Uses Next.js API proxy to bypass HTTP/2 protocol errors
   */
  async updateItem(
    cartItemId: string,
    data: UpdateCartItemRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<BackendCartItem> {
    // Use proxy route to bypass HTTP/2 errors
    const response = await fetchWithAuth(`/api/cart/items/${cartItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<BackendCartItem>(response)
  },

  /**
   * Remove item from cart
   * Uses Next.js API proxy to bypass HTTP/2 protocol errors
   */
  async removeItem(
    cartItemId: string,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<void> {
    // Use proxy route to bypass HTTP/2 errors
    const response = await fetchWithAuth(`/api/cart/items/${cartItemId}`, {
      method: "DELETE",
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    if (!response.ok) {
      await handleResponse<void>(response)
    }
  },

  /**
   * Clear entire cart
   * Uses Next.js API proxy to bypass HTTP/2 protocol errors
   */
  async clearCart(
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<void> {
    // Use proxy route to bypass HTTP/2 errors
    const response = await fetchWithAuth("/api/cart", {
      method: "DELETE",
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    if (!response.ok) {
      await handleResponse<void>(response)
    }
  },
}

