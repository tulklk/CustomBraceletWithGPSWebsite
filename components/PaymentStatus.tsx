"use client"

import { usePayOsCallback } from "@/hooks/usePayOsCallback"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, AlertCircle, Mail } from "lucide-react"
import { useUser } from "@/store/useUser"
import { ordersApi } from "@/lib/api/orders"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function PaymentStatusContent() {
  const { isProcessing, isSuccess, isCanceled, error, orderCode, callbackParams } = usePayOsCallback()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, makeAuthenticatedRequest } = useUser()
  const { toast } = useToast()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<any>(null)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [emailNotificationShown, setEmailNotificationShown] = useState(false)

  // Show email notification immediately when payment is successful
  useEffect(() => {
    if (isSuccess && !emailNotificationShown && user?.email) {
      toast({
        title: "Thanh toán thành công! ✅",
        description: `Email xác nhận đơn hàng đã được gửi đến ${user.email}. Vui lòng kiểm tra hộp thư của bạn.`,
        duration: 7000,
        className: "bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800",
      })
      setEmailNotificationShown(true)
    }
  }, [isSuccess, emailNotificationShown, user?.email, toast])

  useEffect(() => {
    // Fetch order details if orderId is available
    // When payment is successful, refresh order to get updated payment status from backend
    if (orderId && (isSuccess || isCanceled)) {
      setLoadingOrder(true)
      const fetchOrder = async () => {
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
          
          // Show email confirmation notification when payment is successful (if not shown yet and user email not available from context)
          if (isSuccess && !emailNotificationShown && !user?.email) {
            const userEmail = orderData?.email || orderData?.shippingAddress?.email
            if (userEmail) {
              toast({
                title: "Thanh toán thành công! ✅",
                description: `Email xác nhận đơn hàng đã được gửi đến ${userEmail}. Vui lòng kiểm tra hộp thư của bạn.`,
                duration: 7000,
                className: "bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800",
              })
              setEmailNotificationShown(true)
            }
          }
          
          // If payment was successful, the backend should have updated paymentStatus via webhook
          // If paymentStatus is still 0 (pending), wait a bit and refresh again
          if (isSuccess && orderData && orderData.paymentStatus === 0) {
            // Wait 2 seconds for webhook to process, then refresh again
            setTimeout(async () => {
              try {
                let refreshedOrder: any
                if (user?.accessToken) {
                  refreshedOrder = await makeAuthenticatedRequest(async (token: string) => {
                    return await ordersApi.getOrderById(
                      orderId,
                      token,
                      user.refreshToken
                    )
                  })
                } else {
                  refreshedOrder = await ordersApi.getGuestOrderById(orderId)
                }
                setOrder(refreshedOrder)
              } catch (error) {
                console.error("Failed to refresh order after payment:", error)
              }
            }, 2000)
          }
        } catch (error) {
          console.error("Failed to fetch order details:", error)
        } finally {
          setLoadingOrder(false)
        }
      }
      fetchOrder()
    }
  }, [orderId, isSuccess, isCanceled, user, makeAuthenticatedRequest, emailNotificationShown, toast])

  if (isProcessing) {
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

  if (isSuccess) {
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

              {loadingOrder ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : order ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">#{order.orderNumber || order.id}</p>
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
              ) : orderId ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">#{orderId}</p>
                </div>
              ) : null}

              <div className="flex gap-4 pt-4">
                {orderId && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Smooth navigation to account page with orderId
                      // Add openOrder=true to signal that user wants to view order details
                      if (user?.accessToken) {
                        router.push(`/account?order=${orderId}&tab=orders&openOrder=true`, { scroll: false })
                      } else {
                        router.push(`/?order=${orderId}`, { scroll: false })
                      }
                    }}
                  >
                    Xem đơn hàng
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

  if (isCanceled) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <CardTitle className="text-2xl">Thanh toán đã bị hủy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-orange-800 dark:text-orange-200">
                  Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu và bạn có thể thanh toán lại bất cứ lúc nào.
                </p>
              </div>

              {loadingOrder ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : order ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">#{order.orderNumber || order.id}</p>
                </div>
              ) : orderId ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">#{orderId}</p>
                </div>
              ) : null}

              <div className="flex gap-4 pt-4">
                {orderId && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Smooth navigation to account page with orderId
                      // Add openOrder=true to signal that user wants to view order details
                      if (user?.accessToken) {
                        router.push(`/account?order=${orderId}&tab=orders&openOrder=true`, { scroll: false })
                      } else {
                        router.push(`/?order=${orderId}`, { scroll: false })
                      }
                    }}
                  >
                    Xem đơn hàng
                  </Button>
                )}
                <Button asChild>
                  <Link href="/checkout">Thử lại thanh toán</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/products">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
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
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>

              {loadingOrder ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : order ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">#{order.orderNumber || order.id}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Đơn hàng của bạn vẫn được lưu. Bạn có thể thanh toán lại sau.
                  </p>
                </div>
              ) : orderId ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">#{orderId}</p>
                </div>
              ) : null}

              <div className="flex gap-4 pt-4">
                {orderId && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Smooth navigation to account page with orderId
                      // Add openOrder=true to signal that user wants to view order details
                      if (user?.accessToken) {
                        router.push(`/account?order=${orderId}&tab=orders&openOrder=true`, { scroll: false })
                      } else {
                        router.push(`/?order=${orderId}`, { scroll: false })
                      }
                    }}
                  >
                    Xem đơn hàng
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

  return null
}

export function PaymentStatus() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <PaymentStatusContent />
    </Suspense>
  )
}

