"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { useUser } from "@/store/useUser"
import { ordersApi } from "@/lib/api/orders"
import Link from "next/link"

// Component to handle search params (needs Suspense boundary)
function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, makeAuthenticatedRequest } = useUser()
  const [orderId] = useState(searchParams.get("orderId"))
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false)
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
      } catch (error) {
        console.error("Failed to fetch order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, user])

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Lấy email để hiển thị trong thông báo (ưu tiên email user login, fallback email từ order)
  const getOrderEmail = () => {
    if (user?.email) return user.email
    return (
      (order as any)?.userEmail ||
      (order as any)?.guestEmail ||
      (order as any)?.email ||
      ""
    )
  }

  const orderEmail = order ? getOrderEmail() : ""
  const isBankTransfer = order?.paymentMethod === 1 // 1: PayOS / chuyển khoản

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <CardTitle className="text-2xl">Đặt hàng thành công!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 text-sm md:text-base">
                {isBankTransfer ? (
                  <>
                    Đơn của bạn đã chuyển khoản thành công và đơn được xử lý.{" "}
                    {orderEmail ? (
                      <>
                        Chúng tôi đã gửi email xác nhận đến{" "}
                        <span className="font-semibold">{orderEmail}</span>, vui lòng kiểm tra hòm thư của bạn.
                      </>
                    ) : (
                      <>Chúng tôi đã gửi email xác nhận, vui lòng kiểm tra hòm thư của bạn.</>
                    )}
                  </>
                ) : (
                  <>
                    Đơn hàng của bạn đã được tiếp nhận và đang xử lý.{" "}
                    {orderEmail ? (
                      <>
                        Chúng tôi đã gửi email xác nhận đến{" "}
                        <span className="font-semibold">{orderEmail}</span>, vui lòng kiểm tra hòm thư của bạn.
                      </>
                    ) : (
                      <>Chúng tôi đã gửi email xác nhận, vui lòng kiểm tra hòm thư của bạn.</>
                    )}
                  </>
                )}
              </p>
            </div>

            {order && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="text-lg font-semibold">{order.orderNumber || order.id}</p>
                </div>

                {order.totalAmount && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                    <p className="text-lg font-semibold text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.totalAmount)}
                    </p>
                  </div>
                )}

                {order.paymentMethod === 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Phương thức thanh toán:</strong> COD (Thanh toán khi nhận hàng)
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                      Bạn sẽ thanh toán khi nhận được hàng. Vui lòng chuẩn bị đúng số tiền.
                    </p>
                  </div>
                )}

                {order.shippingAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Địa chỉ giao hàng:</p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p className="text-sm text-muted-foreground">{order.shippingAddress.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.shippingAddress.addressLine}, {order.shippingAddress.ward}, {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {orderId && user?.accessToken && (
                <Button asChild variant="outline">
                  <Link href={`/account?order=${orderId}&tab=orders&openOrder=true`}>
                    Xem chi tiết đơn hàng
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

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}

