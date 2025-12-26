import { API_BASE_URL } from "@/lib/constants"
import { handleResponse, fetchWithAuth } from "./auth"

// Shipping Address Type
export interface ShippingAddress {
  fullName: string
  phoneNumber: string
  addressLine: string
  ward: string
  district: string // Required by backend, but can be empty string
  city: string
}

// Order Item Request (for creating order)
export interface CreateOrderItemRequest {
  productId: string
  productVariantId?: string // Optional variant ID
  quantity: number
}

// Create Order Request (for authenticated users)
export interface CreateOrderRequest {
  shippingAddress: ShippingAddress | null
  paymentMethod: "COD" | "PayOS" // Chỉ chấp nhận 2 giá trị này
  voucherCode?: string
}

// Create Guest Order Request (for guest checkout - matches backend API)
export interface CreateGuestOrderRequest {
  email: string
  fullName: string
  shippingAddress: ShippingAddress
  paymentMethod: "COD" | "PayOS"
  items: CreateOrderItemRequest[]
  voucherCode?: string
}

// Order Item Type
export interface OrderItem {
  id: string
  productId: string
  productName?: string
  productImage?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  design?: {
    templateId?: string
    colors?: {
      band?: string
      face?: string
    }
    engraving?: {
      text?: string
      font?: string
    }
  }
}

// Order Status Type (number from backend: 0: Pending, 1: Paid, 2: Processing, 3: Shipped, 4: Delivered, 5: Cancelled)
export type OrderStatus = 
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"

// Order Type (matching backend response)
export interface Order {
  id: string // Order ID (Guid)
  orderNumber: string // Order Number (Guid)
  userId: string
  totalAmount: number
  orderStatus: number // 0: Pending, 1: Paid, 2: Processing, 3: Shipped, 4: Delivered, 5: Cancelled
  paymentStatus: number // 0: Pending, 1: Paid
  paymentMethod: number // 0: COD, 1: PayOS
  items: Array<{
    id: string
    productId: string
    productNameSnapshot: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
  shippingAddress?: ShippingAddress
  voucherCode?: string
  discountAmount?: number
  subtotal?: number
  status?: OrderStatus // Legacy field for compatibility
  createdAt: string
  updatedAt?: string
}

// Apply Voucher Request
export interface ApplyVoucherRequest {
  voucherCode: string
}

// Apply Voucher Response
export interface ApplyVoucherResponse {
  isValid: boolean
  discountAmount?: number
  message?: string
}

// Payment Request (for PayOS)
export interface PaymentRequest {
  provider: "PayOS"
  returnUrl?: string // URL để redirect sau khi thanh toán thành công
  cancelUrl?: string // URL để redirect khi hủy thanh toán
}

// Payment Response
export interface PaymentResponse {
  paymentUrl: string // URL để redirect đến PayOS checkout page
}

// Orders API Service
export const ordersApi = {
  /**
   * Create a new order (with authentication)
   * POST /api/Orders
   * Uses Next.js API proxy to bypass HTTP/2 protocol errors
   */
  async createOrder(
    data: CreateOrderRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<Order> {
    // Use proxy route to bypass HTTP/2 errors
    const response = await fetchWithAuth("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<Order>(response)
  },

  /**
   * Create a new order (without authentication - for guest checkout)
   * POST /api/guest/orders
   */
  async createOrderWithoutAuth(data: CreateGuestOrderRequest): Promise<Order> {
    try {
      console.log("Creating guest order with data:", JSON.stringify(data, null, 2))
      
      // Use Next.js API route as proxy to bypass HTTP/2 protocol errors
      const response = await fetch("/api/guest/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log("Response status:", response.status, response.statusText)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is ok before trying to parse
      if (!response.ok) {
        let errorText: string
        try {
          errorText = await response.text()
        } catch (e) {
          errorText = `Failed to read error response: ${e}`
        }
        
        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` }
        }
        errorData.statusCode = response.status
        console.error("Order creation error:", errorData)
        throw errorData
      }

      // Try to parse JSON response
      const contentType = response.headers.get("content-type")
      console.log("Content-Type:", contentType)
      
      // Check if response is ok
      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          const errorText = await response.text()
          errorData = { message: errorText || `HTTP error! status: ${response.status}` }
        }
        errorData.statusCode = response.status
        console.error("Order creation error:", errorData)
        throw errorData
      }

      // Parse JSON response (proxy route ensures valid JSON)
      const jsonData = await response.json()
      console.log("Order created successfully:", jsonData)
      return jsonData as Order
    } catch (error: any) {
      console.error("Order creation exception:", error)
      // Re-throw if it's already an ApiError
      if (error.statusCode !== undefined) {
        throw error
      }
      // Otherwise wrap in a generic error
      throw {
        message: error.message || "Failed to create order. Please try again.",
        statusCode: 0,
      }
    }
  },

  /**
   * Apply voucher code (with authentication)
   * POST /api/Orders/apply-voucher
   */
  async applyVoucher(
    data: ApplyVoucherRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<ApplyVoucherResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Orders/apply-voucher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<ApplyVoucherResponse>(response)
  },

  /**
   * Apply voucher code (without authentication - for guest checkout)
   * POST /api/guest/orders/apply-voucher
   */
  async applyVoucherWithoutAuth(data: ApplyVoucherRequest): Promise<ApplyVoucherResponse> {
    // Use Next.js API route as proxy to bypass HTTP/2 protocol errors
    const response = await fetch("/api/guest/orders/apply-voucher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw { ...errorData, statusCode: response.status }
    }

    return await response.json()
  },

  /**
   * Get current user's orders
   * GET /api/Orders/my
   */
  async getMyOrders(
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<Order[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Orders/my`, {
      method: "GET",
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<Order[]>(response)
  },

  /**
   * Get order by ID
   * GET /api/Orders/{id}
   */
  async getOrderById(
    orderId: string,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<Order> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Orders/${orderId}`, {
      method: "GET",
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<Order>(response)
  },

  /**
   * Get order status
   * GET /api/Orders/{id}/status
   */
  async getOrderStatus(
    orderId: string,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<{ status: OrderStatus }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Orders/${orderId}/status`, {
      method: "GET",
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<{ status: OrderStatus }>(response)
  },

  /**
   * Create payment link for PayOS (with authentication)
   * POST /api/Orders/{id}/payment
   */
  async createPaymentLink(
    orderId: string,
    data: PaymentRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<PaymentResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/Orders/${orderId}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      accessToken,
      refreshToken,
      onTokenRefresh,
    })

    return handleResponse<PaymentResponse>(response)
  },

  /**
   * Create payment link for PayOS (without authentication - for guest checkout)
   * POST /api/guest/orders/{id}/payment
   */
  async createPaymentLinkWithoutAuth(
    orderId: string,
    data: PaymentRequest
  ): Promise<PaymentResponse> {
    // Use Next.js API route as proxy to bypass HTTP/2 protocol errors
    const response = await fetch(`/api/guest/orders/${orderId}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw { ...errorData, statusCode: response.status }
    }

    return await response.json()
  },

  /**
   * @deprecated Use createPaymentLink instead
   * Process payment for order (with authentication)
   * POST /api/Orders/{id}/payment
   */
  async processPayment(
    orderId: string,
    data: PaymentRequest,
    accessToken: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<PaymentResponse> {
    return this.createPaymentLink(orderId, data, accessToken, refreshToken, onTokenRefresh)
  },

  /**
   * @deprecated Use createPaymentLinkWithoutAuth instead
   * Process payment for order (without authentication - for guest checkout)
   * POST /api/guest/orders/{id}/payment
   */
  async processPaymentWithoutAuth(
    orderId: string,
    data: PaymentRequest
  ): Promise<PaymentResponse> {
    return this.createPaymentLinkWithoutAuth(orderId, data)
  },

  /**
   * Get guest order by ID
   * GET /api/guest/orders/{id}
   */
  async getGuestOrderById(orderId: string): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/guest/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return handleResponse<Order>(response)
  },

  /**
   * Lookup guest order (by phone number and order number)
   * GET /api/guest/orders/lookup
   */
  async lookupGuestOrder(phoneNumber: string, orderNumber: string): Promise<Order> {
    const params = new URLSearchParams({
      phoneNumber,
      orderNumber,
    })
    
    const response = await fetch(`${API_BASE_URL}/api/guest/orders/lookup?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return handleResponse<Order>(response)
  },

  /**
   * Get guest order status by order number
   * GET /api/guest/orders/status/{orderNumber}
   */
  async getGuestOrderStatus(orderNumber: string): Promise<{ status: OrderStatus }> {
    const response = await fetch(`${API_BASE_URL}/api/guest/orders/status/${orderNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return handleResponse<{ status: OrderStatus }>(response)
  },
}

