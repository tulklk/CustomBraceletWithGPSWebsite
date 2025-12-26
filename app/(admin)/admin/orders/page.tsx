"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminOrder, OrderDetail, OrderStatus, ORDER_STATUS_MAP } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import dayjs from "dayjs"
import "dayjs/locale/vi"
dayjs.locale("vi")

export default function OrdersPage() {
  const { user, makeAuthenticatedRequest } = useUser()
  const { toast } = useToast()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [productImages, setProductImages] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user?.accessToken) return
    fetchOrders()
  }, [user?.accessToken, makeAuthenticatedRequest])

  const fetchOrders = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const data = await makeAuthenticatedRequest((token) => adminApi.orders.getAll(token))
      // Map API response để đảm bảo tương thích với code hiện tại
      const mappedOrders = data.map((order) => ({
        ...order,
        orderCode: order.orderNumber || order.orderCode, // Sử dụng orderNumber từ API
        customerName: order.userFullName || order.guestFullName || order.guestEmail || order.customerName,
        customerEmail: order.userEmail || order.guestEmail || order.customerEmail,
        customerId: order.userId || order.customerId,
      }))
      setOrders(mappedOrders)
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải đơn hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = async (order: AdminOrder) => {
    if (!user?.accessToken) return
    try {
      const orderDetail = await makeAuthenticatedRequest((token) => adminApi.orders.getById(token, order.id))
      setSelectedOrder(orderDetail)
      setDialogOpen(true)
      
      // Fetch product images for all items in the order
      const imageMap: Record<string, string> = {}
      await Promise.all(
        orderDetail.items.map(async (item) => {
          try {
            const product = await makeAuthenticatedRequest((token) => 
              adminApi.products.getById(token, item.productId)
            )
            // Get first image from images, imageUrls array, or imageUrl field
            // Priority: images[0] > imageUrls[0] > imageUrl
            const imageUrl = 
              (product.images && product.images.length > 0 && product.images[0]) ||
              (product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0]) ||
              product.imageUrl ||
              ""
            if (imageUrl) {
              imageMap[item.productId] = imageUrl
            }
          } catch (error) {
            console.error(`Error fetching product image for ${item.productId}:`, error)
          }
        })
      )
      setProductImages(imageMap)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết đơn hàng",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!user?.accessToken || !selectedOrder) return
    try {
      setUpdatingStatus(true)
      await makeAuthenticatedRequest((token) => 
        adminApi.orders.updateStatus(token, selectedOrder.id, newStatus)
      )
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái đơn hàng",
      })
      // Refresh order detail
      const refreshedOrder = await makeAuthenticatedRequest((token) => 
        adminApi.orders.getById(token, selectedOrder.id)
      )
      setSelectedOrder(refreshedOrder)
      // Refresh orders list
      fetchOrders()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const columns = [
    {
      key: "orderCode",
      label: "Mã đơn hàng",
      sortable: true,
      render: (order: AdminOrder) => (
        <span className="font-mono font-medium">{order.orderNumber || order.orderCode || "N/A"}</span>
      ),
    },
    {
      key: "customerName",
      label: "Khách hàng",
      sortable: true,
      render: (order: AdminOrder) => {
        // Ưu tiên hiển thị tên khách hàng
        const customerName = order.userFullName || order.guestFullName || order.customerName
        const customerEmail = order.userEmail || order.guestEmail || order.customerEmail
        return (
          <div>
            <p className="font-medium">{customerName || customerEmail || "N/A"}</p>
            {customerEmail && customerName && (
              <p className="text-xs text-muted-foreground">{customerEmail}</p>
            )}
          </div>
        )
      },
    },
    {
      key: "totalAmount",
      label: "Tổng tiền",
      sortable: true,
      render: (order: AdminOrder) => (
        <span className="font-medium">
          {order.totalAmount ? formatCurrency(order.totalAmount) : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      render: (order: AdminOrder) => {
        // Sử dụng orderStatus (number) từ API, map sang label từ ORDER_STATUS_MAP
        if (order.orderStatus !== undefined && order.orderStatus !== null) {
          const statusEntry = Object.entries(ORDER_STATUS_MAP).find(
            ([_, value]) => value.value === order.orderStatus
          )
          if (statusEntry) {
            const statusLabel = ORDER_STATUS_MAP[statusEntry[0] as OrderStatus].label
            const statusVariant = 
              order.orderStatus === 5 ? "destructive" : // Canceled
              order.orderStatus === 4 ? "default" : // Completed
              "secondary" // Processing, Confirmed, Preparing, Shipped
            return <Badge variant={statusVariant}>{statusLabel}</Badge>
          }
        }
        // Fallback nếu không có orderStatus
        if (order.status) {
          const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
            "Đang xử lý": { label: "Đang xử lý", variant: "default" },
            "Đã xác nhận": { label: "Đã xác nhận", variant: "default" },
            "Đã giao": { label: "Đã giao", variant: "default" },
            "Đã hủy": { label: "Đã hủy", variant: "destructive" },
          }
          const status = statusMap[order.status] || { label: order.status, variant: "secondary" as const }
          return <Badge variant={status.variant}>{status.label}</Badge>
        }
        return <Badge variant="secondary">N/A</Badge>
      },
    },
    {
      key: "paymentStatus",
      label: "Thanh toán",
      render: (order: AdminOrder) => {
        // Sử dụng paymentStatus (number) từ API
        // 0: Chờ thanh toán, 1: Đã thanh toán
        if (typeof order.paymentStatus === "number") {
          if (order.paymentStatus === 1) {
            return <Badge variant="default">Đã thanh toán</Badge>
          } else if (order.paymentStatus === 0) {
            return <Badge variant="secondary">Chờ thanh toán</Badge>
          }
        }
        // Fallback nếu paymentStatus là string
        if (typeof order.paymentStatus === "string") {
          const paymentMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
            "Chờ thanh toán": { label: "Chờ thanh toán", variant: "secondary" },
            "Đã thanh toán": { label: "Đã thanh toán", variant: "default" },
            "Đã hoàn tiền": { label: "Đã hoàn tiền", variant: "destructive" },
          }
          const payment = paymentMap[order.paymentStatus] || { label: order.paymentStatus, variant: "secondary" as const }
          return <Badge variant={payment.variant}>{payment.label}</Badge>
        }
        return <Badge variant="secondary">N/A</Badge>
      },
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (order: AdminOrder) => {
        if (!order.createdAt) {
          return <span className="text-muted-foreground">N/A</span>
        }
        const date = dayjs(order.createdAt)
        return date.format("DD [tháng] MM, YYYY")
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (order: AdminOrder) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewOrder(order)}
        >
          Xem
        </Button>
      ),
    },
  ]

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    const orderCode = order.orderNumber || order.orderCode || ""
    const customerName = order.userFullName || order.guestEmail || order.customerName || ""
    const customerEmail = order.userEmail || order.guestEmail || order.customerEmail || ""
    
    const matchesSearch =
      orderCode.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      customerEmail.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === "all" || !order.status || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground mt-1">
          Tìm kiếm và quản lý tất cả đơn hàng trong hệ thống
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>TÌM KIẾM ĐƠN HÀNG</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Tìm theo mã đơn, khách hàng hoặc tổng tiền"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredOrders}
            columns={columns}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          // Reset product images when dialog closes
          setProductImages({})
          setSelectedOrder(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-medium font-mono">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">
                    {dayjs(selectedOrder.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  {(() => {
                    const statusEntry = Object.entries(ORDER_STATUS_MAP).find(
                      ([_, value]) => value.value === selectedOrder.orderStatus
                    )
                    const statusLabel = statusEntry ? ORDER_STATUS_MAP[statusEntry[0] as OrderStatus].label : "N/A"
                    const statusVariant = selectedOrder.orderStatus === 5 ? "destructive" : 
                                         selectedOrder.orderStatus === 4 ? "default" : "secondary"
                    return <Badge variant={statusVariant}>{statusLabel}</Badge>
                  })()}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thanh toán</p>
                  <Badge variant={selectedOrder.paymentStatus === 1 ? "default" : "secondary"}>
                    {selectedOrder.paymentStatus === 1 ? "Đã thanh toán" : "Chờ thanh toán"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                  <p className="font-medium">
                    {selectedOrder.paymentMethod === 0 ? "COD" : selectedOrder.paymentMethod === 1 ? "PayOS" : "N/A"}
                  </p>
                </div>
                {selectedOrder.paymentTransactionId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mã giao dịch</p>
                    <p className="font-medium font-mono text-xs">{selectedOrder.paymentTransactionId}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Separator />
                  <p className="text-sm text-muted-foreground mt-4">Tổng tiền</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedOrder.totalAmount)}</p>
                  {selectedOrder.voucherCode && selectedOrder.voucherDiscountAmount && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Voucher: {selectedOrder.voucherCode}</p>
                      <p>Giảm giá: -{formatCurrency(selectedOrder.voucherDiscountAmount)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
                <div className="space-y-2 text-sm">
                  {selectedOrder.userId ? (
                    <>
                      <p><span className="text-muted-foreground">Tên:</span> {selectedOrder.userFullName || "N/A"}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedOrder.userEmail || "N/A"}</p>
                      <p><span className="text-muted-foreground">Loại:</span> Khách hàng đã đăng ký</p>
                    </>
                  ) : (
                    <>
                      <p><span className="text-muted-foreground">Tên:</span> {selectedOrder.guestFullName || "N/A"}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedOrder.guestEmail || "N/A"}</p>
                      <p><span className="text-muted-foreground">Loại:</span> Khách hàng guest</p>
                    </>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingFullName && (
                <div>
                  <h3 className="font-semibold mb-3">Địa chỉ giao hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{selectedOrder.shippingFullName}</p>
                    <p>{selectedOrder.shippingPhoneNumber}</p>
                    <p>{selectedOrder.shippingAddressLine}</p>
                    <p>
                      {[selectedOrder.shippingWard, selectedOrder.shippingDistrict, selectedOrder.shippingCity]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Sản phẩm</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Sản phẩm</th>
                        <th className="text-right p-3 text-sm font-medium">Số lượng</th>
                        <th className="text-right p-3 text-sm font-medium">Đơn giá</th>
                        <th className="text-right p-3 text-sm font-medium">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => {
                        const productImage = productImages[item.productId]
                        return (
                          <tr key={item.id} className="border-t">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {productImage ? (
                                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                    <Image
                                      src={productImage}
                                      alt={item.productNameSnapshot}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">No image</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{item.productNameSnapshot}</p>
                                  {item.variantInfoSnapshot && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.variantInfoSnapshot}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-right">{item.quantity}</td>
                            <td className="p-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 text-sm text-right font-medium">
                              {formatCurrency(item.lineTotal)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="font-semibold mb-3">Cập nhật trạng thái</h3>
                <Select
                  value={(() => {
                    const statusEntry = Object.entries(ORDER_STATUS_MAP).find(
                      ([_, value]) => value.value === selectedOrder.orderStatus
                    )
                    return statusEntry ? (statusEntry[0] as OrderStatus) : undefined
                  })()}
                  onValueChange={(value) => handleUpdateStatus(value as OrderStatus)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ORDER_STATUS_MAP) as OrderStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {ORDER_STATUS_MAP[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updatingStatus && (
                  <p className="mt-2 text-sm text-muted-foreground">Đang cập nhật...</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
