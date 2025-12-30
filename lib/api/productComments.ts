import { API_BASE_URL } from "@/lib/constants"
import { handleResponse } from "./auth"
import { cachedFetch, cacheConfigs, invalidateCache } from "@/lib/cache"

export interface ProductComment {
  id: string
  content: string
  userId: string
  userName?: string // API returns userName
  userFullName?: string // Legacy support
  userEmail?: string
  userAvatar?: string | null
  isAdmin?: boolean
  // Alternative: API might return user object
  user?: {
    id: string
    email: string
    fullName: string
    avatar?: string | null
  }
  // Alternative: API might return fullName directly
  fullName?: string
  email?: string
  avatar?: string | null
  productSlug?: string
  productId?: string
  parentCommentId: string | null
  createdAt: string
  updatedAt: string | null
  isEdited?: boolean
  replies?: ProductComment[]
  isShop?: boolean // For shop replies
}

export interface CreateCommentRequest {
  content: string
}

export interface UpdateCommentRequest {
  content: string
}

export interface CreateReplyRequest {
  content: string
}

export const productCommentsApi = {
  /**
   * Normalize comment data to ensure consistent structure
   */
  normalizeComment(comment: any): ProductComment {
    // API returns userName directly, normalize it
    const normalized: ProductComment = {
      ...comment,
      userName: comment.userName || comment.userFullName || comment.user?.fullName || comment.fullName,
      userFullName: comment.userName || comment.userFullName || comment.user?.fullName || comment.fullName, // Keep for backward compatibility
      userEmail: comment.userEmail || comment.user?.email || comment.email,
      userAvatar: comment.userAvatar || comment.user?.avatar || comment.avatar || null,
    }
    
    return normalized
  },

  /**
   * Get all comments for a product by slug (with cache)
   */
  async getBySlug(slug: string): Promise<ProductComment[]> {
    const comments = await cachedFetch<any[]>(
      `${API_BASE_URL}/api/products/slug/${slug}/comments`,
      {
        method: "GET",
        headers: {
          "accept": "*/*",
        },
      },
      {
        ...cacheConfigs.products,
        storageKey: `product_comments_${slug}`,
      }
    )
    
    // Normalize all comments
    return comments.map(comment => this.normalizeComment(comment))
  },

  /**
   * Get all comments for a product by slug (without cache - force fresh fetch)
   */
  async getBySlugFresh(slug: string): Promise<ProductComment[]> {
    // Invalidate cache first
    invalidateCache(`${API_BASE_URL}/api/products/slug/${slug}/comments`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    }, `product_comments_${slug}`)
    
    // Fetch fresh data
    const response = await fetch(`${API_BASE_URL}/api/products/slug/${slug}/comments`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    })
    
    const comments = await handleResponse<any[]>(response)
    
    // Normalize all comments
    return comments.map(comment => this.normalizeComment(comment))
  },

  /**
   * Create a new comment for a product
   */
  async create(
    accessToken: string,
    slug: string,
    data: CreateCommentRequest
  ): Promise<ProductComment> {
    const response = await fetch(`${API_BASE_URL}/api/products/slug/${slug}/comments`, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    })

    const result = await handleResponse<any>(response)
    const normalizedResult = this.normalizeComment(result)

    // Invalidate comments cache for this product
    invalidateCache(`${API_BASE_URL}/api/products/slug/${slug}/comments`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    }, `product_comments_${slug}`)

    return normalizedResult
  },

  /**
   * Update a comment
   */
  async update(
    accessToken: string,
    slug: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<ProductComment> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/slug/${slug}/comments/${commentId}`,
      {
        method: "PUT",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      }
    )

    const result = await handleResponse<any>(response)
    const normalizedResult = this.normalizeComment(result)

    // Invalidate comments cache for this product
    invalidateCache(`${API_BASE_URL}/api/products/slug/${slug}/comments`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    }, `product_comments_${slug}`)

    return normalizedResult
  },

  /**
   * Delete a comment (only admin can delete)
   */
  async delete(
    accessToken: string,
    slug: string,
    commentId: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/slug/${slug}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      await handleResponse(response)
    } else {
      // Invalidate comments cache for this product
      invalidateCache(`${API_BASE_URL}/api/products/slug/${slug}/comments`, {
        method: "GET",
        headers: {
          "accept": "*/*",
        },
      }, `product_comments_${slug}`)
    }
  },

  /**
   * Reply to a comment
   */
  async reply(
    accessToken: string,
    slug: string,
    parentCommentId: string,
    data: CreateReplyRequest
  ): Promise<ProductComment> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/slug/${slug}/comments/${parentCommentId}/reply`,
      {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      }
    )

    const result = await handleResponse<any>(response)
    const normalizedResult = this.normalizeComment(result)

    // Invalidate comments cache for this product
    invalidateCache(`${API_BASE_URL}/api/products/slug/${slug}/comments`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    }, `product_comments_${slug}`)

    return normalizedResult
  },
}

