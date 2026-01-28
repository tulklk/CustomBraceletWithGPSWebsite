"use client"

import { useState } from "react"
import { Search, Loader2, CheckCircle2, XCircle, Package, Clock, Truck, CheckCircle, CreditCard, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ordersApi, OrderStatus, GuestOrderStatusResponse } from "@/lib/api/orders"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import "dayjs/locale/vi"
dayjs.locale("vi")

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  Pending: {
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: <Clock className="h-4 w-4" />,
  },
  Confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  Processing: {
    label: "Đang xử lý",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    icon: <Package className="h-4 w-4" />,
  },
  Shipped: {
    label: "Đã giao hàng",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    icon: <Truck className="h-4 w-4" />,
  },
  Delivered: {
    label: "Đã nhận hàng",
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  Cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  Pending: {
    label: "Chờ thanh toán",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  Paid: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  },
}

const paymentMethodConfig: Record<string, { label: string }> = {
  COD: {
    label: "Thanh toán khi nhận hàng",
  },
  PayOS: {
    label: "PayOS",
  },
}

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<GuestOrderStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim()) {
      toast({
        title: "Vui lòng nhập mã đơn hàng",
        description: "Mã đơn hàng không được để trống",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)
    setOrderData(null)

    try {
      const result = await ordersApi.getGuestOrderStatus(orderNumber.trim())
      setOrderData(result)
      toast({
        title: "Tra cứu thành công!",
        description: `Trạng thái đơn hàng: ${statusConfig[result.orderStatus]?.label || result.orderStatus}`,
      })
    } catch (error: any) {
      console.error("Order lookup error:", error)
      const errorMessage = error.message || "Không tìm thấy đơn hàng với mã này"
      setError(errorMessage)
      toast({
        title: "Tra cứu thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-center">
          Tra cứu đơn hàng
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm sm:text-base mb-8 sm:mb-10 text-center max-w-md">
          Nhập mã đơn hàng để kiểm tra trạng thái đơn hàng của bạn
        </p>

        {/* Form */}
        <Card className="w-full max-w-lg">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLookup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="text-sm font-medium">
                  # Mã đơn hàng <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="VD: ORD-20251215-B832A195"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="text-sm sm:text-base"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tra cứu...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Tra cứu đơn hàng
                  </>
                )}
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Order Status Result */}
            {orderData && !error && (
              <div className="mt-6 p-6 bg-muted/50 dark:bg-muted/30 rounded-lg border space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Thông tin đơn hàng</h3>
                  <Badge
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1",
                      statusConfig[orderData.orderStatus]?.color
                    )}
                  >
                    {statusConfig[orderData.orderStatus]?.icon}
                    {statusConfig[orderData.orderStatus]?.label || orderData.orderStatus}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order Number */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Mã đơn hàng</p>
                    <p className="text-sm font-medium">{orderData.orderNumber}</p>
                  </div>

                  {/* Order Status */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Trạng thái đơn hàng</p>
                    <Badge
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 w-fit",
                        statusConfig[orderData.orderStatus]?.color
                      )}
                    >
                      {statusConfig[orderData.orderStatus]?.icon}
                      {statusConfig[orderData.orderStatus]?.label || orderData.orderStatus}
                    </Badge>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phương thức thanh toán</p>
                    <p className="text-sm font-medium">
                      {paymentMethodConfig[orderData.paymentMethod]?.label || orderData.paymentMethod}
                    </p>
                  </div>

                  {/* Total Amount */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tổng tiền</p>
                    <p className="text-sm font-semibold text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(orderData.totalAmount)}
                    </p>
                  </div>

                  {/* Created At */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ngày tạo</p>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">
                        {dayjs(orderData.createdAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </div>
                  </div>

                  {/* Updated At */}
                  {orderData.updatedAt && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Cập nhật lần cuối</p>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {dayjs(orderData.updatedAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

