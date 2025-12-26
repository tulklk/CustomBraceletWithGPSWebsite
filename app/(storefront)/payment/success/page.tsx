"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useUser } from "@/store/useUser"
import { ordersApi } from "@/lib/api/orders"
import Link from "next/link"

// Component to handle search params (needs Suspense boundary)
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, makeAuthenticatedRequest } = useUser()
  const [orderId] = useState(searchParams.get("orderId"))
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    // Kiểm tra query params từ PayOS return URL
    const code = searchParams.get("code")
    const cancel = searchParams.get("cancel")
    const paymentStatus = searchParams.get("status")
    const orderCode = searchParams.get("orderCode")

    console.log("Payment return params:", { code, cancel, paymentStatus, orderCode, orderId })

    // Verify order status
    const verifyOrder = async () => {
      if (!orderId) {
        setStatus("failed")
        return
      }

      try {
        let orderData: any
        if (user?.accessToken) {
          orderData = await makeAuthenticatedRequest(async (token: string) => {
            return await ordersApi.getOrderById(
              orderId,
              token,
              user.refreshToken
            )
          })
        } else {
          orderData = await ordersApi.getGuestOrderById(orderId)
        }

        setOrder(orderData)

        // Check payment status from PayOS callback
        if (code === "00" && paymentStatus === "PAID" && cancel !== "true") {
          // Thanh toán thành công
          setStatus("success")
        } else if (cancel === "true" || paymentStatus === "CANCELLED") {
          // Thanh toán bị hủy
          setStatus("failed")
        } else if (paymentStatus === "PENDING" || paymentStatus === "PROCESSING") {
          // Đang xử lý
          setStatus("loading")
          // Wait a bit and check again
          setTimeout(() => {
            verifyOrder()
          }, 2000)
        } else {
          // Check order payment status from backend
          if (orderData.paymentStatus === 1) {
            setStatus("success")
          } else {
            setStatus("failed")
          }
        }
      } catch (error) {
        console.error("Failed to verify order:", error)
        // If we have success params, assume success
        if (code === "00" && paymentStatus === "PAID") {
          setStatus("success")
        } else {
          setStatus("failed")
        }
      }
    }

    verifyOrder()
  }, [searchParams, orderId, user])

  if (status === "loading") {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Đang xử lý thanh toán...</p>
              <p className="text-sm text-muted-foreground">
                Vui lòng đợi trong giây lát
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <CardTitle className="text-2xl">Thanh toán thành công!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200">
                  Đơn hàng của bạn đã được xử lý thành công. Chúng tôi sẽ gửi thông báo qua email hoặc SMS khi đơn hàng được giao.
                </p>
              </div>

              {order && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">{order.orderNumber || order.id}</p>
                  {order.totalAmount && (
                    <>
                      <p className="text-sm text-muted-foreground mt-4">Tổng tiền:</p>
                      <p className="text-lg font-semibold text-primary">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.totalAmount)}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                {orderId && (
                  <Button asChild variant="outline">
                    <Link href={user?.accessToken ? `/account?order=${orderId}` : `/?order=${orderId}`}>
                      Xem đơn hàng
                    </Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/products">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <CardTitle className="text-2xl">Thanh toán thất bại</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">
                Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
              </p>
            </div>

            {order && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                <p className="text-lg font-semibold">{order.orderNumber || order.id}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Đơn hàng của bạn vẫn được lưu. Bạn có thể thanh toán lại sau.
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {orderId && (
                <Button asChild variant="outline">
                  <Link href={user?.accessToken ? `/account?order=${orderId}` : `/?order=${orderId}`}>
                    Xem đơn hàng
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/checkout">Thử lại thanh toán</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Đang xử lý thanh toán...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

