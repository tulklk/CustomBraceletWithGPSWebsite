import { API_BASE_URL } from "@/lib/constants"
import { handleResponse } from "./auth"
import { cachedFetch, cacheConfigs, invalidateCache } from "@/lib/cache"

export interface ProductReview {
  id: string
  productId: string
  userId: string | null
  fullName: string
  phoneNumber: string | null
  email: string | null
  rating: number // 1-5
  comment: string
  reviewImageUrl: string | null
  createdAt: string
  updatedAt: string | null
}

export interface CreateReviewRequest {
  fullName: string
  phoneNumber?: string
  email?: string
  rating: number // 0-5
  comment: string
  reviewImageUrl?: string | null
}

export interface CreateReviewResponse {
  id: string
  productId: string
  userId: string | null
}

export const productReviewsApi = {
  /**
   * Get all reviews for a product by ID or slug (with cache)
   */
  async getByProductIdOrSlug(productIdOrSlug: string): Promise<ProductReview[]> {
    const reviews = await cachedFetch<ProductReview[]>(
      `${API_BASE_URL}/api/products/${productIdOrSlug}/reviews`,
      {
        method: "GET",
        headers: {
          "accept": "*/*",
        },
      },
      {
        ...cacheConfigs.products,
        storageKey: `product_reviews_${productIdOrSlug}`,
      }
    )
    
    return reviews
  },

  /**
   * Get all reviews for a product by ID or slug (without cache - force fresh fetch)
   */
  async getByProductIdOrSlugFresh(productIdOrSlug: string): Promise<ProductReview[]> {
    // Invalidate cache first
    invalidateCache(`${API_BASE_URL}/api/products/${productIdOrSlug}/reviews`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    }, `product_reviews_${productIdOrSlug}`)
    
    // Fetch fresh data
    const response = await fetch(`${API_BASE_URL}/api/products/${productIdOrSlug}/reviews`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    })
    
    const reviews = await handleResponse<ProductReview[]>(response)
    return reviews
  },

  /**
   * Create a new review for a product
   */
  async create(
    productIdOrSlug: string,
    data: CreateReviewRequest
  ): Promise<CreateReviewResponse> {
    const response = await fetch(`${API_BASE_URL}/api/products/${productIdOrSlug}/reviews`, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await handleResponse<CreateReviewResponse>(response)

    // Invalidate reviews cache for this product
    invalidateCache(`${API_BASE_URL}/api/products/${productIdOrSlug}/reviews`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    }, `product_reviews_${productIdOrSlug}`)

    return result
  },
}

