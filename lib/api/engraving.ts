import { API_BASE_URL } from "@/lib/constants"
import { EngravingInfo, ValidateEngravingTextResult } from "@/lib/types/engraving"

/**
 * Get engraving information (isFree, maxLength, allowedCharacters, description)
 */
export async function getEngravingInfo(): Promise<EngravingInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Products/engraving/info`, {
      method: "GET",
      headers: {
        "accept": "*/*",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch engraving info: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching engraving info:", error)
    // Return default values on error
    return {
      isFree: true,
      maxLength: 12,
      allowedCharacters: "A-Z, 0-9, khoảng trắng, dấu gạch (-)",
      description: "Khắc tên (tùy chọn)",
    }
  }
}

/**
 * Validate engraving text
 */
export async function validateEngravingText(
  text: string
): Promise<ValidateEngravingTextResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Products/engraving/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "*/*",
      },
      body: JSON.stringify({ engravingText: text }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Failed to validate engraving text: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error validating engraving text:", error)
    // Return default validation result on error
    return {
      isValid: false,
      errorMessage: "Không thể validate nội dung khắc",
      maxLength: 12,
      allowedCharacters: "A-Z, 0-9, khoảng trắng, dấu gạch (-)",
    }
  }
}

