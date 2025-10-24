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

// User (Mock)
export type User = {
  id: string
  email: string
  name: string
  savedDesigns: CustomDesign[]
}

