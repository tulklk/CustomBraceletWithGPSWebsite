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
}

// Update Cart Item Request
export interface UpdateCartItemRequest {
  quantity: number
}

// Cart API Service
export const cartApi = {
  /**
   * Get current user's cart
   */
  async getCart(accessToken: string, refreshToken?: string, onTokenRefresh?: (newToken: string) => void): Promise<BackendCart> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Cart`, {
      method: "GET",
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<BackendCart>(response)
  },

  /**
   * Add item to cart
   */
  async addItem(
    data: AddCartItemRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<BackendCartItem> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Cart/items`, {
      method: "POST",
      body: JSON.stringify(data),
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<BackendCartItem>(response)
  },

  /**
   * Update cart item quantity
   */
  async updateItem(
    cartItemId: string,
    data: UpdateCartItemRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<BackendCartItem> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Cart/items/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<BackendCartItem>(response)
  },

  /**
   * Remove item from cart
   */
  async removeItem(
    cartItemId: string,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Cart/items/${cartItemId}`, {
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
   */
  async clearCart(
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Cart`, {
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

