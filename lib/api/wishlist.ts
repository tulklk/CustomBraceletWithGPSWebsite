import { API_BASE_URL } from "@/lib/constants"
import { handleResponse } from "./auth"
import { BackendProduct } from "./products"
import { cachedFetch, cacheConfigs, invalidateCache } from "@/lib/cache"

export interface WishlistItem {
  productId: string
  product?: BackendProduct | null
  addedAt: string
}

export const wishlistApi = {
  /**
   * Get all wishlist items for the current user
   */
  async getAll(accessToken: string): Promise<WishlistItem[]> {
    // Note: Cache key includes accessToken to ensure user-specific cache
    // However, we should invalidate cache when wishlist changes
    const cacheKey = `wishlist_all_${accessToken.substring(0, 10)}`
    
    return cachedFetch<WishlistItem[]>(
      `${API_BASE_URL}/api/Wishlist`,
      {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`,
        },
      },
      {
        ...cacheConfigs.wishlist,
        storageKey: cacheKey,
      }
    )
  },

  /**
   * Add a product to wishlist
   */
  async add(accessToken: string, productId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Wishlist/${productId}`, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "Authorization": `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      await handleResponse(response)
    } else {
      // Invalidate wishlist cache when item is added
      const cacheKey = `wishlist_all_${accessToken.substring(0, 10)}`
      invalidateCache(`${API_BASE_URL}/api/Wishlist`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`,
        },
      }, cacheKey)
      // Also invalidate check cache for this product
      invalidateCache(`${API_BASE_URL}/api/Wishlist/${productId}/check`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`,
        },
      })
    }
  },

  /**
   * Remove a product from wishlist
   */
  async remove(accessToken: string, productId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Wishlist/${productId}`, {
      method: "DELETE",
      headers: {
        "accept": "*/*",
        "Authorization": `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      await handleResponse(response)
    } else {
      // Invalidate wishlist cache when item is removed
      const cacheKey = `wishlist_all_${accessToken.substring(0, 10)}`
      invalidateCache(`${API_BASE_URL}/api/Wishlist`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`,
        },
      }, cacheKey)
      // Also invalidate check cache for this product
      invalidateCache(`${API_BASE_URL}/api/Wishlist/${productId}/check`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`,
        },
      })
    }
  },

  /**
   * Check if a product is in wishlist
   * Note: We don't use cachedFetch here because the response might be 404 (not in wishlist)
   * and cachedFetch doesn't handle 404 gracefully. Instead, we handle caching in the component level if needed.
   */
  async check(accessToken: string, productId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Wishlist/${productId}/check`, {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      console.log("Wishlist check response status:", response.status, "for productId:", productId)

      if (!response.ok) {
        // If 404 or any error, product is not in wishlist
        console.log("Wishlist check failed - response not ok")
        return false
      }

      const contentType = response.headers.get("content-type")
      let result: any

      if (contentType && contentType.includes("application/json")) {
        result = await response.json()
      } else {
        const text = await response.text()
        // Try to parse as JSON, otherwise check if it's a boolean string
        try {
          result = JSON.parse(text)
        } catch {
          // If not JSON, check if text is "true" or "false"
          result = text.toLowerCase().trim() === "true"
        }
      }

      console.log("Wishlist check raw result:", result, "type:", typeof result)

      // Handle different response formats
      let finalResult = false
      if (typeof result === "boolean") {
        finalResult = result
      } else if (typeof result === "string") {
        finalResult = result.toLowerCase() === "true"
      } else if (typeof result === "number") {
        finalResult = result === 1
      } else if (typeof result === "object" && result !== null) {
        // Check if it has an 'isInWishlist' or 'inWishlist' property
        if ("isInWishlist" in result) {
          finalResult = Boolean(result.isInWishlist)
        } else if ("inWishlist" in result) {
          finalResult = Boolean(result.inWishlist)
        } else if ("value" in result) {
          finalResult = Boolean(result.value)
        }
      }

      return finalResult
    } catch (error) {
      console.error("Error checking wishlist:", error)
      // On any error, assume not in wishlist
      return false
    }
  },
}

