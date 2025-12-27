import { API_BASE_URL } from "@/lib/constants"
import { handleResponse, fetchWithAuth } from "@/lib/api/auth"
import { CreatePaymentRequest, PaymentResponse, ApiError } from "@/types/payment"

/**
 * Check if error is a PayOS signature error (Code: 201)
 */
function isSignatureError(error: unknown): boolean {
  if (!error) return false
  
  const message = (error as { message?: string; error?: { message?: string } }).message || 
                  (error as { error?: { message?: string } }).error?.message || ""
  return (
    message.includes("signature") ||
    message.includes("Code: 201") ||
    message.includes("Mã kiểm tra")
  )
}

/**
 * Convert payment error to user-friendly message
 */
function getUserFriendlyErrorMessage(error: unknown): string {
  // Handle signature error (Code: 201) - already fixed in backend
  if (isSignatureError(error)) {
    return "Không thể tạo link thanh toán. Vui lòng thử lại sau."
  }
  
  // Handle other PayOS errors
  // Type-safe error message extraction
  const errorObj = error as { message?: string; error?: { message?: string } }
  const message = errorObj.message || errorObj.error?.message || ""
  if (message.includes("PayOS error")) {
    // Generic PayOS error - show user-friendly message
    return "Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại."
  }
  
  // Default error message
  return errorObj.message || "Không thể tạo link thanh toán. Vui lòng thử lại sau."
}

/**
 * Payment Service
 * Handles payment creation for PayOS and other payment providers
 */
class PaymentService {
  /**
   * Create payment URL with PayOS
   * @param orderId - Order ID (Guid)
   * @param returnUrl - URL to redirect after successful payment
   * @param cancelUrl - URL to redirect when user cancels payment
   * @param accessToken - Optional access token for authenticated requests
   * @param refreshToken - Optional refresh token
   * @param onTokenRefresh - Optional callback for token refresh
   * @returns PaymentResponse with paymentUrl and order info
   */
  async createPayment(
    orderId: string,
    returnUrl?: string,
    cancelUrl?: string,
    accessToken?: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ): Promise<PaymentResponse> {
    // Ensure provider is literal type "PayOS" (not just string)
    const request: CreatePaymentRequest = {
      provider: "PayOS" as const,
      returnUrl: returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/payment/success` : undefined),
      cancelUrl: cancelUrl || (typeof window !== 'undefined' ? `${window.location.origin}/payment/cancel` : undefined),
    }

    // Log request for debugging
    console.log("[paymentService] Creating payment request:", {
      orderId,
      provider: request.provider,
      returnUrl: request.returnUrl,
      cancelUrl: request.cancelUrl,
      hasToken: !!accessToken,
    })

    try {
      // Use authenticated endpoint if token is provided
      if (accessToken) {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/Orders/${orderId}/payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
            accessToken,
            refreshToken,
            onTokenRefresh,
          }
        )

        // Log response status
        console.log("[paymentService] Response status:", response.status)

        const result = await handleResponse<PaymentResponse>(response)
        
        // Validate response structure
        const paymentUrl = result.paymentUrl || 
                          (result as { payment_url?: string }).payment_url || 
                          (result as { url?: string }).url
        if (!paymentUrl) {
          const error: ApiError = {
            message: "Invalid payment response: missing paymentUrl",
            statusCode: 500,
          }
          throw error
        }

        // Normalize paymentUrl field
        const normalizedResult: PaymentResponse = {
          ...result,
          paymentUrl,
        }

        return normalizedResult
      } else {
        // Use guest endpoint
        // Use Next.js API route as proxy to bypass HTTP/2 protocol errors
        const response = await fetch(`/api/guest/orders/${orderId}/payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
          },
          body: JSON.stringify(request),
        })

        // Log response status
        console.log("[paymentService] Guest response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("[paymentService] Guest payment error:", errorData)
          const apiError: ApiError = {
            message: errorData.message || errorData.error?.message || "Failed to create payment",
            statusCode: response.status,
            error: errorData.error,
          }
          throw apiError
        }

        const result = await response.json() as PaymentResponse

        // Normalize paymentUrl field
        const paymentUrl = result.paymentUrl || 
                          (result as { payment_url?: string }).payment_url || 
                          (result as { url?: string }).url
        const normalizedResult: PaymentResponse = {
          ...result,
          paymentUrl: paymentUrl || "",
        }

        return normalizedResult
      }
    } catch (error) {
      // Log error for debugging (especially signature errors)
      if (isSignatureError(error)) {
        console.error("[paymentService] Signature error detected (Code: 201):", error)
        console.log("[paymentService] Note: This error has been fixed in backend. If you still see it, please check backend deployment.")
      } else {
        console.error("[paymentService] Payment error:", error)
      }
      
      // Preserve error structure from backend
      // If it's already an ApiError (from handleResponse), re-throw it with user-friendly message
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const apiError = error as ApiError
        const userFriendlyMessage = getUserFriendlyErrorMessage(apiError)
        
        // Create a new Error with user-friendly message but preserve statusCode for logging
        const errorWithStatus = new Error(userFriendlyMessage) as Error & { 
          statusCode?: number
          originalMessage?: string
        }
        errorWithStatus.statusCode = apiError.statusCode
        errorWithStatus.originalMessage = apiError.message // Preserve original for logging
        
        throw errorWithStatus
      }
      
      // If it's a regular Error, convert to user-friendly message
      const userFriendlyMessage = getUserFriendlyErrorMessage(error)
      const errorMessage = error instanceof Error ? userFriendlyMessage : "Không thể tạo link thanh toán. Vui lòng thử lại sau."
      
      throw new Error(errorMessage)
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()

