import { API_BASE_URL } from "@/lib/constants"
import { handleResponse } from "./auth"
import { NewsDto, NewsListParams, ChildAbductionNewsResponse } from "@/lib/types"
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
   * Get child abduction news with pagination
   * Uses Next.js API route proxy to bypass CORS issues
   */
  async getChildAbductionNews(page: number = 1, pageSize: number = 6): Promise<ChildAbductionNewsResponse> {
    // Use Next.js API route proxy to bypass CORS issues
    const url = `/api/news/child-abduction?page=${page}&pageSize=${pageSize}`

    const response = await fetch(url, { method: "GET" })
    return handleResponse<ChildAbductionNewsResponse>(response)
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

