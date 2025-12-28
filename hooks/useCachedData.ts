/**
 * Custom hooks for cached data fetching
 */

import { useState, useEffect, useCallback } from "react"
import { productsApi } from "@/lib/api/products"
import { categoriesApi } from "@/lib/api/categories"
import { provincesApi } from "@/lib/api/provinces"
import { invalidateCache } from "@/lib/cache"

// Generic cached data hook
export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options?: {
    enabled?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: any) => void
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return
    
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
      options?.onSuccess?.(result)
    } catch (err) {
      setError(err)
      options?.onError?.(err)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, options?.enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Products hooks
export function useProducts() {
  return useCachedData(() => productsApi.getAll(), [])
}

export function useProduct(slug: string | null) {
  return useCachedData(
    async () => {
      if (!slug) return null
      return await productsApi.getBySlug(slug)
    },
    [slug],
    { enabled: !!slug }
  )
}

// Categories hook
export function useCategories() {
  return useCachedData(() => categoriesApi.getAll(), [])
}

// Provinces hooks
export function useProvinces() {
  return useCachedData(() => provincesApi.getProvinces(), [])
}

export function useWardsByProvince(provinceCode: string | null) {
  return useCachedData(
    async () => {
      if (!provinceCode) return []
      return await provincesApi.getWardsByProvince(provinceCode)
    },
    [provinceCode],
    { enabled: !!provinceCode }
  )
}

// Cache invalidation helpers
export function useInvalidateCache() {
  const invalidateProducts = useCallback(() => {
    // Invalidate all products cache
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes("products") || key.includes("PRODUCTS")) {
          localStorage.removeItem(key)
        }
      })
      keys.forEach(key => {
        if (key.includes("products") || key.includes("PRODUCTS")) {
          sessionStorage.removeItem(key)
        }
      })
    }
  }, [])

  const invalidateProduct = useCallback((slug: string) => {
    invalidateCache("", undefined, `product_detail_${slug}`)
  }, [])

  const invalidateCategories = useCallback(() => {
    // Invalidate categories cache
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes("categories") || key.includes("CATEGORIES")) {
          localStorage.removeItem(key)
        }
      })
      keys.forEach(key => {
        if (key.includes("categories") || key.includes("CATEGORIES")) {
          sessionStorage.removeItem(key)
        }
      })
    }
  }, [])

  return {
    invalidateProducts,
    invalidateProduct,
    invalidateCategories,
  }
}

