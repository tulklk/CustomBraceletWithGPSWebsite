import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PayOsCallbackParams } from "@/types/payment"

interface UsePayOsCallbackReturn {
  isProcessing: boolean
  isSuccess: boolean
  isCanceled: boolean
  error: string | null
  orderCode: number | null
  callbackParams: PayOsCallbackParams
}

export function usePayOsCallback(): UsePayOsCallbackReturn {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCanceled, setIsCanceled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState<number | null>(null)
  const [callbackParams, setCallbackParams] = useState<PayOsCallbackParams>({})

  useEffect(() => {
    const code = searchParams.get("code")
    const status = searchParams.get("status")
    const cancel = searchParams.get("cancel")
    const orderCodeParam = searchParams.get("orderCode")
    const id = searchParams.get("id")

    const params: PayOsCallbackParams = {
      code: code || undefined,
      id: id || undefined,
      cancel: cancel || undefined,
      status: status || undefined,
      orderCode: orderCodeParam || undefined,
    }

    setCallbackParams(params)

    if (orderCodeParam) {
      const parsed = parseInt(orderCodeParam, 10)
      if (!isNaN(parsed)) {
        setOrderCode(parsed)
      }
    }

    // Check if payment was canceled
    if (cancel === "true" || status === "CANCELLED") {
      setIsCanceled(true)
      setIsProcessing(false)
      return
    }

    // Check if payment was successful
    // PayOS success code is "00" or status "PAID"
    if (code === "00" || status === "PAID") {
      setIsSuccess(true)
      setIsProcessing(false)
    } else if (code && code !== "00") {
      // Payment failed
      setError(`Payment failed with code: ${code}`)
      setIsProcessing(false)
    } else {
      // Unknown status - keep processing
      setIsProcessing(true)
    }
  }, [searchParams])

  return {
    isProcessing,
    isSuccess,
    isCanceled,
    error,
    orderCode,
    callbackParams,
  }
}

