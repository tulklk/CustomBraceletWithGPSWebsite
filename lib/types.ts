// Color Options
export type ColorOption = {
  id: string
  name: string
  hex: string
}

// Accessory (Charms)
export type Accessory = {
  id: string
  name: string
  price: number
  icon: string
  compatiblePositions: ("top" | "left" | "right" | "bottom")[]
}

// Template
export type Template = {
  id: string
  name: string
  basePrice: number
  defaultColors: {
    band: string
    face: string
    rim: string
  }
  recommendedAccessories: string[]
  preview: string
  description?: string
}

// Engrave
export type Engrave = {
  text: string
  font: "Sans" | "Rounded" | "Mono"
  position: "inside" | "band"
}

// Custom Design
export type CustomDesign = {
  productId: string
  templateId: string
  colors: {
    band: string
    face: string
    rim: string
  }
  accessories: {
    accessoryId: string
    position: "top" | "left" | "right" | "bottom"
  }[]
  engrave?: Engrave
  unitPrice: number // base + accessories + engraving
  previewDataURL?: string
}

// Cart Item
export type CartItem = {
  id: string
  design: CustomDesign
  qty: number
}

// Product
export type Product = {
  id: string
  name: string
  slug: string
  priceFrom: number
  images: string[]
  specs: {
    waterproof: string
    battery: string
    gps: boolean
    simCard: boolean
    weight: string
  }
  description: string
  features: string[]
}

// Order
export type Order = {
  id: string
  items: CartItem[]
  total: number
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  createdAt: string
  status: "pending" | "processing" | "completed"
}

// Chat Message
export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

// Backend User (from API)
export type BackendUser = {
  id: string
  email: string
  fullName: string
  phoneNumber: string | null
  avatar: string | null
  role: number
  emailVerified: boolean
  isActive?: boolean // User account status
}

// Auth Response from API
export type AuthResponse = {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  user: BackendUser
}

// User (for frontend store, includes savedDesigns)
export type User = {
  id: string
  email: string
  name: string
  fullName?: string
  phoneNumber?: string | null
  avatar?: string | null
  role?: number
  emailVerified?: boolean
  savedDesigns: CustomDesign[]
  accessToken?: string
  refreshToken?: string
}

// Admin Types
export type AdminCategory = {
  id: string
  name: string
  slug?: string
  description?: string | null
  parentId?: string | null
  createdAt?: string
  updatedAt?: string
}

export type AdminNews = {
  id: string
  title: string
  content: string
  summary?: string | null
  imageUrl?: string | null
  categoryId?: string | null
  published: boolean
  views?: number
  createdAt?: string
  updatedAt?: string
}

export type AdminVoucher = {
  id: string
  code: string
  name: string
  description?: string | null
  discountType: "Percent" | "Amount"
  discountValue: number
  minimumOrderAmount?: number | null
  maximumDiscountAmount?: number | null
  totalUsageLimit?: number | null
  usageLimitPerCustomer?: number | null
  startDate: string
  endDate: string
  published: boolean
  createdAt?: string
  updatedAt?: string
}

// Order Status Types
export type OrderStatus = 
  | "Processing"
  | "Confirmed"
  | "Preparing"
  | "Shipped"
  | "Completed"
  | "Canceled"

// Order Status Mapping (for display)
export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; value: number }> = {
  Processing: { label: "Đang xử lý", value: 0 },
  Confirmed: { label: "Đã xác nhận", value: 1 },
  Preparing: { label: "Đang chuẩn bị", value: 2 },
  Shipped: { label: "Đã giao hàng", value: 3 },
  Completed: { label: "Hoàn thành", value: 4 },
  Canceled: { label: "Đã hủy", value: 5 },
}

// Order Item Interface
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productVariantId: string | null
  productNameSnapshot: string
  variantInfoSnapshot: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

// Order Detail Interface (full order with all fields from API)
export interface OrderDetail {
  id: string
  orderNumber: string
  userId: string | null
  userEmail: string | null
  userFullName: string | null
  guestEmail: string | null
  guestFullName: string | null
  totalAmount: number
  paymentStatus: number // 0: Pending, 1: Paid, etc.
  orderStatus: number // 0-5 (see ORDER_STATUS_MAP)
  paymentMethod: number // 0: COD, 1: PayOS
  paymentTransactionId: string | null
  shippingFullName: string | null
  shippingPhoneNumber: string | null
  shippingAddressLine: string | null
  shippingWard: string | null
  shippingDistrict: string | null
  shippingCity: string | null
  voucherId: string | null
  voucherCode: string | null
  voucherDiscountAmount: number | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string | null
}

// Update Status Request
export interface UpdateOrderStatusRequest {
  status: OrderStatus
}

// Update Status Response
export interface UpdateOrderStatusResponse {
  message: string
}

export type AdminOrder = {
  id: string
  orderNumber: string // API trả về orderNumber, không phải orderCode
  userId?: string | null
  userEmail?: string | null
  userFullName?: string | null
  guestEmail?: string | null
  guestFullName?: string | null
  // Legacy fields for backward compatibility
  orderCode?: string // Map từ orderNumber
  customerId?: string
  customerName?: string // Map từ userFullName hoặc guestEmail
  customerEmail?: string // Map từ userEmail hoặc guestEmail
  totalAmount?: number
  status?: string
  orderStatus?: number // Numeric status from API
  paymentStatus?: number | string // Can be number or string
  paymentMethod?: number
  createdAt?: string
  updatedAt?: string
}

export type AdminProduct = {
  id: string
  name: string
  slug?: string
  description?: string | null
  price: number
  stock?: number // Legacy field, may be undefined
  stockQuantity?: number // Backend field name
  originalPrice?: number | null
  brand?: string | null
  categoryId?: string | null
  imageUrl?: string | null
  images?: string[]
  imageUrls?: string[] // Backend field name
  isActive?: boolean
  hasVariants?: boolean
  variants?: any[]
  createdAt?: string
  updatedAt?: string
}

export type AdminUser = {
  id: string
  email: string
  fullName: string
  phoneNumber?: string | null
  role: number
  status?: string // Mapped from isActive
  isActive?: boolean // From backend
  createdAt: string
  updatedAt?: string
}

export type AdminReport = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCategories: number
  dailyRevenue?: Array<{
    date: string
    revenue: number
  }>
  topProducts?: Array<{
    productId: string
    productName: string
    revenue: number
  }>
}

