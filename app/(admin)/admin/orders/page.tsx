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
import { AdminOrder } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import "dayjs/locale/vi"
dayjs.locale("vi")

export default function OrdersPage() {
  const { user, makeAuthenticatedRequest } = useUser()
  const { toast } = useToast()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!user?.accessToken) return
    fetchOrders()
  }, [user?.accessToken, makeAuthenticatedRequest])

  const fetchOrders = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const data = await makeAuthenticatedRequest((token) => adminApi.orders.getAll(token))
      setOrders(data)
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
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết đơn hàng",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!user?.accessToken || !selectedOrder) return
    try {
      const updatedOrder = await makeAuthenticatedRequest((token) => 
        adminApi.orders.updateStatus(token, selectedOrder.id, newStatus)
      )
      setSelectedOrder(updatedOrder)
      setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái đơn hàng",
      })
      setDialogOpen(false)
      fetchOrders()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
    }
  }

  const columns = [
    {
      key: "orderCode",
      label: "Mã đơn hàng",
      sortable: true,
      render: (order: AdminOrder) => (
        <span className="font-mono font-medium">{order.orderCode}</span>
      ),
    },
    {
      key: "customerName",
      label: "Khách hàng",
      sortable: true,
      render: (order: AdminOrder) => (
        <div>
          <p className="font-medium">{order.customerName || order.customerEmail || "N/A"}</p>
          {order.customerEmail && order.customerName && (
            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
          )}
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Tổng tiền",
      sortable: true,
      render: (order: AdminOrder) => (
        <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      render: (order: AdminOrder) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
          "Đang xử lý": { label: "Đang xử lý", variant: "default" },
          "Đã xác nhận": { label: "Đã xác nhận", variant: "default" },
          "Đã giao": { label: "Đã giao", variant: "default" },
          "Đã hủy": { label: "Đã hủy", variant: "destructive" },
        }
        const status = statusMap[order.status] || { label: order.status, variant: "secondary" as const }
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "paymentStatus",
      label: "Thanh toán",
      render: (order: AdminOrder) => {
        const paymentMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
          "Chờ thanh toán": { label: "Chờ thanh toán", variant: "secondary" },
          "Đã thanh toán": { label: "Đã thanh toán", variant: "default" },
          "Đã hoàn tiền": { label: "Đã hoàn tiền", variant: "destructive" },
        }
        const payment = paymentMap[order.paymentStatus] || { label: order.paymentStatus, variant: "secondary" as const }
        return <Badge variant={payment.variant}>{payment.label}</Badge>
      },
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (order: AdminOrder) => {
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
    const matchesSearch =
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.orderCode}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-medium">{selectedOrder.orderCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">
                    {dayjs(selectedOrder.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thanh toán</p>
                  <Badge variant="secondary">{selectedOrder.paymentStatus}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Tổng tiền</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Tên:</span> {selectedOrder.customerName || "N/A"}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customerEmail || "N/A"}</p>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex gap-2">
                <Select
                  defaultValue={selectedOrder.status}
                  onValueChange={handleUpdateStatus}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                    <SelectItem value="Đã xác nhận">Đã xác nhận</SelectItem>
                    <SelectItem value="Đã giao">Đã giao</SelectItem>
                    <SelectItem value="Đã hủy">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
