import { API_BASE_URL } from "@/lib/constants"

export interface ChatMessage {
  message: string
  sessionId?: string | null
}

export interface SuggestedProductDto {
  id: string
  name: string
  brand: string
  price: number
  originalPrice: number
  primaryImageUrl?: string
  imageUrls: string[]
  averageRating: number
  reviewCount: number
  stockQuantity: number
}

export interface ChatResponseDto {
  message: string
  success: boolean
  error?: string | null
  suggestedProducts: SuggestedProductDto[]
  sessionId?: string
}

export async function sendChatMessage(
  message: string,
  sessionId?: string | null
): Promise<ChatResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/Chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "*/*",
    },
    body: JSON.stringify({
      message,
      sessionId: sessionId || null,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send message: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  
  // Map response to match our interface
  // Backend might return 'response' instead of 'message', handle both
  return {
    message: data.message || data.response || "",
    success: data.success !== false, // Default to true if not specified
    error: data.error || null,
    suggestedProducts: data.suggestedProducts || [],
    sessionId: data.sessionId || sessionId || undefined,
  }
}

