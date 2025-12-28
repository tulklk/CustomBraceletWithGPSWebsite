import { API_BASE_URL } from "@/lib/constants"
import { handleResponse } from "./auth"
import { cachedFetch, cacheConfigs } from "@/lib/cache"

// Category type from backend
export interface Category {
  id?: string
  name: string
  description: string | null
  parentId: string | null
  parent?: Category | null
  slug?: string
}

// Public Categories API Service
export const categoriesApi = {
  /**
   * Get all categories (public endpoint) - with caching
   */
  async getAll(): Promise<Category[]> {
    return cachedFetch<Category[]>(
      `${API_BASE_URL}/api/Categories`,
      {
        method: "GET",
        headers: {
          "accept": "*/*",
        },
      },
      cacheConfigs.categories
    )
  },
}

