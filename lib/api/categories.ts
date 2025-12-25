import { API_BASE_URL } from "@/lib/constants"
import { handleResponse } from "./auth"

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
   * Get all categories (public endpoint)
   */
  async getAll(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/Categories`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    })

    return handleResponse<Category[]>(response)
  },
}

