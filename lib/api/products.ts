import { API_BASE_URL } from "@/lib/constants"
import { Product } from "@/lib/types"
import { handleResponse } from "./auth"

// Backend Product Response Type
export interface BackendProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  originalPrice: number | null
  stockQuantity: number
  brand: string | null
  isActive: boolean
  images?: string[]
  imageUrls?: string[]
  hasVariants?: boolean
  variants?: any[]
  categoryId: string | null
  createdAt?: string
  updatedAt?: string | null
}

// Public Products API Service
export const productsApi = {
  /**
   * Get all products (public endpoint)
   */
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/api/Products`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
    })

    const backendProducts = await handleResponse<BackendProduct[]>(response)
    
    // Map backend products to frontend Product type
    return backendProducts
      .filter((p) => p.isActive) // Only show active products
      .map((p) => this.mapToProduct(p))
  },

  /**
   * Get product by slug (returns full backend product data)
   */
  async getBySlug(slug: string): Promise<BackendProduct | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Products/${slug}`, {
        method: "GET",
        headers: {
          "accept": "*/*",
        },
      })

      if (response.status === 404) {
        return null
      }

      const backendProduct = await handleResponse<BackendProduct>(response)
      return backendProduct
    } catch (error) {
      console.error("Error fetching product by slug:", error)
      return null
    }
  },

  /**
   * Get product by slug (mapped to Product type for compatibility)
   */
  async getBySlugMapped(slug: string): Promise<Product | null> {
    const backendProduct = await this.getBySlug(slug)
    if (!backendProduct) return null
    return this.mapToProduct(backendProduct)
  },

  /**
   * Map backend product to frontend Product type
   */
  mapToProduct(backendProduct: BackendProduct): Product {
    // Get images from images array or imageUrls array
    const images = backendProduct.images && backendProduct.images.length > 0
      ? backendProduct.images
      : backendProduct.imageUrls && backendProduct.imageUrls.length > 0
      ? backendProduct.imageUrls
      : []

    // Extract specs from description or use defaults
    // You may need to adjust this based on your backend structure
    const specs = {
      waterproof: "IP67", // Default or extract from backend
      battery: "400mAh - 3-5 ngày", // Default or extract from backend
      gps: true, // Default or extract from backend
      simCard: true, // Default or extract from backend
      weight: "35g", // Default or extract from backend
    }

    // Extract features from description or use defaults
    const features = backendProduct.description
      ? [
          "Định vị GPS/LBS chính xác",
          "Thiết kế độc quyền",
          "Chống nước IP67",
          "Pin lâu dài",
        ]
      : []

    return {
      id: backendProduct.id,
      name: backendProduct.name,
      slug: backendProduct.slug,
      priceFrom: backendProduct.price,
      images: images,
      specs: specs,
      description: backendProduct.description || "",
      features: features,
    }
  },
}

