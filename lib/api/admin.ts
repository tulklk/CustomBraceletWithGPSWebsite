import { API_BASE_URL } from "@/lib/constants"
import { handleResponse, createAuthHeaders, ApiError } from "./auth"
import {
  AdminCategory,
  AdminNews,
  AdminVoucher,
  AdminOrder,
  AdminProduct,
  AdminUser,
  AdminReport,
  OrderDetail,
  OrderStatus,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from "@/lib/types"

// Admin API Service
export const adminApi = {
  // Categories API
  categories: {
    async getAll(accessToken: string): Promise<AdminCategory[]> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminCategories`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      return handleResponse<AdminCategory[]>(response)
    },

    async getById(accessToken: string, id: string): Promise<AdminCategory> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminCategories/${id}`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      return handleResponse<AdminCategory>(response)
    },

    async create(accessToken: string, data: Partial<AdminCategory>): Promise<AdminCategory> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminCategories`, {
        method: "POST",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      return handleResponse<AdminCategory>(response)
    },

    async update(accessToken: string, id: string, data: Partial<AdminCategory>): Promise<AdminCategory> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminCategories/${id}`, {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      return handleResponse<AdminCategory>(response)
    },

    async delete(accessToken: string, id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminCategories/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(accessToken),
      })
      if (!response.ok) {
        await handleResponse(response)
      }
    },
  },

  // News API
  news: {
    async getAll(accessToken: string): Promise<AdminNews[]> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminNews`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      return handleResponse<AdminNews[]>(response)
    },

    async getById(accessToken: string, id: string): Promise<AdminNews> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminNews/${id}`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      return handleResponse<AdminNews>(response)
    },

    async create(accessToken: string, data: Partial<AdminNews>): Promise<AdminNews> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminNews`, {
        method: "POST",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      return handleResponse<AdminNews>(response)
    },

    async update(accessToken: string, id: string, data: Partial<AdminNews>): Promise<AdminNews> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminNews/${id}`, {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      return handleResponse<AdminNews>(response)
    },

    async delete(accessToken: string, id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminNews/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(accessToken),
      })
      if (!response.ok) {
        await handleResponse(response)
      }
    },
  },

  // Orders API
  orders: {
    async getAll(accessToken: string): Promise<AdminOrder[]> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminOrders`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      return handleResponse<AdminOrder[]>(response)
    },

    async getById(accessToken: string, id: string): Promise<OrderDetail> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminOrders/${id}`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found")
        }
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login as admin")
        }
        throw new Error(`Failed to fetch order: ${response.statusText}`)
      }
      
      return handleResponse<OrderDetail>(response)
    },

    async updateStatus(
      accessToken: string,
      id: string,
      status: OrderStatus
    ): Promise<UpdateOrderStatusResponse> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminOrders/${id}/status`, {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify({ status } as UpdateOrderStatusRequest),
      })
      
      if (!response.ok) {
        let errorMessage = "Unknown error"
        try {
          const errorData: { message: string } = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText
        }
        
        if (response.status === 400) {
          throw new Error(errorMessage || "Invalid order status")
        }
        if (response.status === 404) {
          throw new Error(errorMessage || "Order not found")
        }
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login as admin")
        }
        throw new Error(errorMessage || `Failed to update order status: ${response.statusText}`)
      }
      
      return handleResponse<UpdateOrderStatusResponse>(response)
    },
  },

  // Products API
  products: {
    async getAll(accessToken: string): Promise<AdminProduct[]> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminProducts`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      return handleResponse<AdminProduct[]>(response)
    },

    async getById(accessToken: string, id: string): Promise<AdminProduct> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminProducts/${id}`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      return handleResponse<AdminProduct>(response)
    },

    async create(accessToken: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminProducts`, {
        method: "POST",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      return handleResponse<AdminProduct>(response)
    },

    async update(accessToken: string, id: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminProducts/${id}`, {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      return handleResponse<AdminProduct>(response)
    },

    async delete(accessToken: string, id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminProducts/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(accessToken),
      })
      if (!response.ok) {
        await handleResponse(response)
      }
    },
  },

  // Users API
  users: {
    async getAll(accessToken: string): Promise<AdminUser[]> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminUsers`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      const users = await handleResponse<any[]>(response)
      // Transform isActive (boolean) to status (string)
      return users.map((user) => ({
        ...user,
        status: user.isActive === true ? "Hoạt động" : "Không hoạt động",
      }))
    },

    async getById(accessToken: string, id: string): Promise<AdminUser> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminUsers/${id}`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      const user = await handleResponse<any>(response)
      // Transform isActive (boolean) to status (string)
      return {
        ...user,
        status: user.isActive === true ? "Hoạt động" : "Không hoạt động",
      }
    },

    async update(accessToken: string, id: string, data: Partial<AdminUser>): Promise<AdminUser> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminUsers/${id}`, {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      const user = await handleResponse<any>(response)
      // Transform isActive (boolean) to status (string)
      return {
        ...user,
        status: user.isActive === true ? "Hoạt động" : "Không hoạt động",
      }
    },

    async updateStatus(accessToken: string, id: string, status: string): Promise<AdminUser> {
      // Convert status string to isActive boolean for backend
      const isActive = status === "Hoạt động" || status.toLowerCase() === "active"
      // Try PATCH first, if that doesn't work, fall back to PUT on main endpoint
      let response
      try {
        response = await fetch(`${API_BASE_URL}/api/admin/AdminUsers/${id}/status`, {
          method: "PATCH",
          headers: createAuthHeaders(accessToken),
          body: JSON.stringify({ isActive }),
        })
        if (!response.ok && response.status === 405) {
          // If PATCH doesn't work, try PUT on main endpoint
          response = await fetch(`${API_BASE_URL}/api/admin/AdminUsers/${id}`, {
            method: "PUT",
            headers: createAuthHeaders(accessToken),
            body: JSON.stringify({ isActive }),
          })
        }
      } catch {
        // Fallback: update via main endpoint
        response = await fetch(`${API_BASE_URL}/api/admin/AdminUsers/${id}`, {
          method: "PUT",
          headers: createAuthHeaders(accessToken),
          body: JSON.stringify({ isActive }),
        })
      }
      const user = await handleResponse<any>(response)
      // Transform isActive (boolean) to status (string)
      return {
        ...user,
        status: user.isActive === true ? "Hoạt động" : "Không hoạt động",
      }
    },

    async delete(accessToken: string, id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminUsers/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(accessToken),
      })
      if (!response.ok) {
        await handleResponse(response)
      }
    },
  },

  // Vouchers API
  vouchers: {
    // Helper to map backend response to frontend format
    mapBackendToFrontend(backendVoucher: any): AdminVoucher {
      return {
        id: backendVoucher.id,
        code: backendVoucher.code,
        name: backendVoucher.name,
        description: backendVoucher.description ?? null,
        discountType: backendVoucher.discountType,
        discountValue: backendVoucher.discountValue,
        minimumOrderAmount: backendVoucher.minOrderAmount ?? null,
        maximumDiscountAmount: backendVoucher.maxDiscountAmount ?? null,
        totalUsageLimit: backendVoucher.usageLimitTotal ?? null,
        usageLimitPerCustomer: backendVoucher.usageLimitPerCustomer ?? null,
        startDate: backendVoucher.startDate,
        endDate: backendVoucher.endDate,
        published: backendVoucher.isPublic ?? false,
        createdAt: backendVoucher.createdAt,
        updatedAt: backendVoucher.updatedAt,
      }
    },

    // Helper to map frontend format to backend format
    mapFrontendToBackend(frontendVoucher: Partial<AdminVoucher>): any {
      const backendData: any = {}
      
      if (frontendVoucher.code !== undefined) backendData.code = frontendVoucher.code
      if (frontendVoucher.name !== undefined) backendData.name = frontendVoucher.name
      if (frontendVoucher.description !== undefined) backendData.description = frontendVoucher.description
      if (frontendVoucher.discountType !== undefined) backendData.discountType = frontendVoucher.discountType
      if (frontendVoucher.discountValue !== undefined) backendData.discountValue = frontendVoucher.discountValue
      if (frontendVoucher.minimumOrderAmount !== undefined) backendData.minOrderAmount = frontendVoucher.minimumOrderAmount
      if (frontendVoucher.maximumDiscountAmount !== undefined) backendData.maxDiscountAmount = frontendVoucher.maximumDiscountAmount
      if (frontendVoucher.totalUsageLimit !== undefined) backendData.usageLimitTotal = frontendVoucher.totalUsageLimit
      if (frontendVoucher.usageLimitPerCustomer !== undefined) backendData.usageLimitPerCustomer = frontendVoucher.usageLimitPerCustomer
      if (frontendVoucher.startDate !== undefined) backendData.startDate = frontendVoucher.startDate
      if (frontendVoucher.endDate !== undefined) backendData.endDate = frontendVoucher.endDate
      if (frontendVoucher.published !== undefined) backendData.isPublic = frontendVoucher.published
      
      return backendData
    },

    async getAll(accessToken: string): Promise<AdminVoucher[]> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminVouchers`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      const backendData = await handleResponse<any[]>(response)
      return backendData.map(v => this.mapBackendToFrontend(v))
    },

    async getById(accessToken: string, id: string): Promise<AdminVoucher> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminVouchers/${id}`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      const backendData = await handleResponse<any>(response)
      return this.mapBackendToFrontend(backendData)
    },

    async create(accessToken: string, data: Partial<AdminVoucher>): Promise<AdminVoucher> {
      const backendData = this.mapFrontendToBackend(data)
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminVouchers`, {
        method: "POST",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(backendData),
      })
      const backendResponse = await handleResponse<any>(response)
      return this.mapBackendToFrontend(backendResponse)
    },

    async update(accessToken: string, id: string, data: Partial<AdminVoucher>): Promise<AdminVoucher> {
      const backendData = this.mapFrontendToBackend(data)
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminVouchers/${id}`, {
        method: "PUT",
        headers: createAuthHeaders(accessToken),
        body: JSON.stringify(backendData),
      })
      const backendResponse = await handleResponse<any>(response)
      return this.mapBackendToFrontend(backendResponse)
    },

    async publish(accessToken: string, id: string): Promise<AdminVoucher> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminVouchers/${id}/publish`, {
        method: "PATCH",
        headers: createAuthHeaders(accessToken),
      })
      const backendResponse = await handleResponse<any>(response)
      return this.mapBackendToFrontend(backendResponse)
    },

    async delete(accessToken: string, id: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}/api/admin/AdminVouchers/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(accessToken),
      })
      if (!response.ok) {
        await handleResponse(response)
      }
    },
  },

  // Reports API (calculated from orders)
  reports: {
    async getStats(accessToken: string, startDate?: string, endDate?: string): Promise<AdminReport> {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      
      const url = `${API_BASE_URL}/api/admin/AdminOrders${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      const orders = await handleResponse<AdminOrder[]>(response)
      
      // Calculate stats from orders
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalOrders = orders.length
      
      // Get products count (would need separate API call in real scenario)
      const productsResponse = await fetch(`${API_BASE_URL}/api/admin/AdminProducts`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      const products = await handleResponse<AdminProduct[]>(productsResponse)
      const totalProducts = products.length
      
      // Get categories count
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/admin/AdminCategories`, {
        method: "GET",
        headers: createAuthHeaders(accessToken),
      })
      const categories = await handleResponse<AdminCategory[]>(categoriesResponse)
      const totalCategories = categories.length
      
      // Calculate daily revenue
      const dailyRevenueMap = new Map<string, number>()
      orders
        .filter((order): order is AdminOrder & { createdAt: string } => !!order.createdAt)
        .forEach(order => {
          const date = order.createdAt.split('T')[0]
          dailyRevenueMap.set(date, (dailyRevenueMap.get(date) || 0) + (order.totalAmount || 0))
        })
      const dailyRevenue = Array.from(dailyRevenueMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))
      
      // Calculate top products (simplified - would need order items in real scenario)
      const topProducts: Array<{ productId: string; productName: string; revenue: number }> = []
      
      return {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCategories,
        dailyRevenue,
        topProducts,
      }
    },
  },
}

