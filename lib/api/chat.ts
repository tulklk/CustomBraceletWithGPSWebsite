import { API_BASE_URL } from "@/lib/constants"

export interface ChatMessage {
  message: string
  sessionId?: string | null
}

export interface ChatResponse {
  response: string
  sessionId: string
}

export async function sendChatMessage(
  message: string,
  sessionId?: string | null
): Promise<ChatResponse> {
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
  return data
}

