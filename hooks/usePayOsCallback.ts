import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PayOsCallbackParams } from "@/types/payment"

const PAYMENT_TIMEOUT_MS = 7000
const PAYMENT_TIMEOUT_ERROR =
  "Không thể xác nhận trạng thái thanh toán lúc này. Vui lòng kiểm tra lại đơn hàng hoặc liên hệ hỗ trợ."

type CallbackState = "processing" | "success" | "canceled" | "failed"

interface UsePayOsCallbackReturn {
  isProcessing: boolean
  isSuccess: boolean
  isCanceled: boolean
  error: string | null
  orderCode: number | null
  callbackParams: PayOsCallbackParams
}

interface CallbackResolution {
  state: CallbackState
  error: string | null
}

function parsePayOsCallbackParams(searchParams: URLSearchParams): PayOsCallbackParams {
  const provider = searchParams.get("provider")
  const code = searchParams.get("code")
  const status = searchParams.get("status")
  const cancel = searchParams.get("cancel")
  const orderCode = searchParams.get("orderCode")
  const orderId = searchParams.get("orderId")
  const orderNumber = searchParams.get("orderNumber")
  const id = searchParams.get("id")

  return {
    provider: provider || undefined,
    code: code || undefined,
    status: status || undefined,
    cancel: cancel || undefined,
    orderCode: orderCode || undefined,
    orderId: orderId || undefined,
    orderNumber: orderNumber || undefined,
    id: id || undefined,
  }
}

function resolvePayOsCallbackState(params: PayOsCallbackParams): CallbackResolution {
  const normalizedCancel = params.cancel?.toLowerCase()
  const normalizedStatus = params.status?.toUpperCase()
  const hasOrderReference = Boolean(params.orderId || params.orderNumber)

  if (normalizedCancel === "true" || normalizedStatus === "CANCELLED") {
    return { state: "canceled", error: null }
  }

  if (hasOrderReference) {
    return { state: "success", error: null }
  }

  if (params.code === "00" || normalizedStatus === "PAID") {
    return { state: "success", error: null }
  }

  if (params.code && params.code !== "00") {
    return { state: "failed", error: `Payment failed with code: ${params.code}` }
  }

  return { state: "processing", error: null }
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
    const params = parsePayOsCallbackParams(searchParams)
    const resolution = resolvePayOsCallbackState(params)

    setCallbackParams(params)
    setError(resolution.error)
    setIsProcessing(resolution.state === "processing")
    setIsSuccess(resolution.state === "success")
    setIsCanceled(resolution.state === "canceled")

    if (params.orderCode) {
      const parsed = parseInt(String(params.orderCode), 10)
      setOrderCode(Number.isNaN(parsed) ? null : parsed)
    } else {
      setOrderCode(null)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isProcessing) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(false)
      setIsCanceled(false)
      setError(PAYMENT_TIMEOUT_ERROR)
    }, PAYMENT_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [isProcessing])

  return {
    isProcessing,
    isSuccess,
    isCanceled,
    error,
    orderCode,
    callbackParams,
  }
}

