"use client"

import { useState } from "react"
import { usePayment } from "@/hooks/usePayment"
import { Button } from "@/components/ui/button"
import { PaymentResponse } from "@/types/payment"

interface PaymentButtonProps {
  orderId: string
  returnUrl?: string
  cancelUrl?: string
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  onSuccess?: (paymentData: PaymentResponse) => void
  onError?: (error: string) => void
  accessToken?: string
  refreshToken?: string
  onTokenRefresh?: (newToken: string) => void
}

export function PaymentButton({
  orderId,
  returnUrl,
  cancelUrl,
  className,
  disabled,
  children,
  onSuccess,
  onError,
  accessToken,
  refreshToken,
  onTokenRefresh,
}: PaymentButtonProps) {
  const { createPayment, isLoading, error, paymentData } = usePayment()
  const [localError, setLocalError] = useState<string | null>(null)

  const handlePayment = async () => {
    try {
      setLocalError(null)
      await createPayment(
        orderId,
        returnUrl,
        cancelUrl,
        accessToken,
        refreshToken,
        onTokenRefresh
      )

      // Call success callback if payment data is available
      // Note: paymentData might be null if redirect happens immediately
      if (paymentData && onSuccess) {
        onSuccess(paymentData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create payment"
      setLocalError(errorMessage)

      if (onError) {
        onError(errorMessage)
      }
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className={className}
      >
        {isLoading ? "Đang xử lý..." : children || "Thanh toán với PayOS"}
      </Button>
      {(error || localError) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error || localError}
        </p>
      )}
    </div>
  )
}

