import { useState, useCallback } from "react"
import { paymentService } from "@/lib/services/paymentService"
import { PaymentResponse } from "@/types/payment"

interface UsePaymentReturn {
  createPayment: (
    orderId: string,
    returnUrl?: string,
    cancelUrl?: string,
    accessToken?: string,
    refreshToken?: string,
    onTokenRefresh?: (newToken: string) => void
  ) => Promise<void>
  isLoading: boolean
  error: string | null
  paymentData: PaymentResponse | null
}

export function usePayment(): UsePaymentReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null)

  const createPayment = useCallback(
    async (
      orderId: string,
      returnUrl?: string,
      cancelUrl?: string,
      accessToken?: string,
      refreshToken?: string,
      onTokenRefresh?: (newToken: string) => void
    ) => {
      setIsLoading(true)
      setError(null)
      setPaymentData(null)

      try {
        const data = await paymentService.createPayment(
          orderId,
          returnUrl,
          cancelUrl,
          accessToken,
          refreshToken,
          onTokenRefresh
        )
        setPaymentData(data)

        // Automatically redirect to payment URL if available
        if (typeof window !== "undefined" && data.paymentUrl) {
          window.location.href = data.paymentUrl
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create payment"
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    createPayment,
    isLoading,
    error,
    paymentData,
  }
}

