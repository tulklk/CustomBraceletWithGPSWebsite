import { ColorOption } from "./types"

export const COLOR_PALETTE: ColorOption[] = [
  { id: "pink", name: "Hồng", hex: "#FF69B4" },
  { id: "blue", name: "Xanh dương", hex: "#4169E1" },
  { id: "purple", name: "Tím", hex: "#9370DB" },
  { id: "green", name: "Xanh lá", hex: "#32CD32" },
  { id: "orange", name: "Cam", hex: "#FF8C00" },
  { id: "red", name: "Đỏ", hex: "#DC143C" },
  { id: "yellow", name: "Vàng", hex: "#FFD700" },
  { id: "cyan", name: "Xanh ngọc", hex: "#00CED1" },
  { id: "black", name: "Đen", hex: "#1a1a1a" },
  { id: "white", name: "Trắng", hex: "#FFFFFF" },
  { id: "gray", name: "Xám", hex: "#808080" },
  { id: "navy", name: "Xanh navy", hex: "#000080" },
]

export const ENGRAVE_FEE = 50000 // 50,000 VND
export const MAX_ACCESSORIES = 12 // Tối đa 12 charm dọc theo dây
export const MAX_ENGRAVE_LENGTH = 12
export const ENGRAVE_FONTS = ["Sans", "Rounded", "Mono"] as const

export const QUICK_CHAT_CHIPS = [
  "Bảo hành",
  "Thời gian giao hàng",
  "Cách khắc tên",
]

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? "https://localhost:7285"
    : "https://customerbraceletwithgpswebsite-backend.fly.dev")

// Frontend Base URL for PayOS return/cancel URLs
// Use environment variable or fallback to production URL
export const FRONTEND_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://custom-bracelet-with-gps-website.vercel.app"

// Log for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[Constants] ========== URL Configuration ==========')
  console.log('[Constants] API_BASE_URL (Backend):', API_BASE_URL)
  console.log('[Constants] NEXT_PUBLIC_API_URL from env:', process.env.NEXT_PUBLIC_API_URL)
  console.log('[Constants] FRONTEND_BASE_URL (Frontend):', FRONTEND_BASE_URL)
  console.log('[Constants] NEXT_PUBLIC_BASE_URL from env:', process.env.NEXT_PUBLIC_BASE_URL)
}

