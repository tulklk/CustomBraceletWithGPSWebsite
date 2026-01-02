import { API_BASE_URL } from "@/lib/constants"
import { handleResponse } from "./auth"
import { NewsDto, NewsListParams } from "@/lib/types"
import { cachedFetch, cacheConfigs } from "@/lib/cache"

// Public News API Service
export const newsApi = {
  /**
   * Get all published news with pagination, filtering, and search
   */
  async getAll(params?: NewsListParams): Promise<NewsDto[]> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params?.category) searchParams.append("category", params.category)
    if (params?.search) searchParams.append("search", params.search)

    const url = `${API_BASE_URL}/api/news${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    
    const response = await cachedFetch<NewsDto[]>(
      url,
      { method: "GET" },
      {
        ...cacheConfigs.products,
        storageKey: `news_list_${searchParams.toString()}`,
      }
    )
    
    return response
  },

  /**
   * Get news by ID or slug
   * @param idOrSlug - News ID or slug
   * @param incrementViewCount - Whether to increment view count (default: true)
   */
  async getById(idOrSlug: string, incrementViewCount: boolean = true): Promise<NewsDto | null> {
    try {
      const url = `${API_BASE_URL}/api/news/${idOrSlug}?incrementViewCount=${incrementViewCount}`
      
      // Don't cache if incrementing view count
      if (incrementViewCount) {
        const response = await fetch(url, { method: "GET" })
        if (response.status === 404) return null
        return handleResponse<NewsDto>(response)
      } else {
        // Cache if not incrementing (for preview mode)
        const response = await cachedFetch<NewsDto>(
          url,
          { method: "GET" },
          {
            ...cacheConfigs.products,
            storageKey: `news_${idOrSlug}`,
          }
        )
        return response
      }
    } catch (error: any) {
      if (error.statusCode === 404) return null
      throw error
    }
  },
}

