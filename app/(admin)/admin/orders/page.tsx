"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Order } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch orders
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching orders:", error)
        setLoading(false)
      })
  }, [])

  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  const columns = [
    {
      key: "id",
      label: "Mã đơn",
      sortable: true,
      render: (order: Order) => (
        <span className="font-mono font-medium">{order.id}</span>
      ),
    },
    {
      key: "customer",
      label: "Khách hàng",
      sortable: true,
      render: (order: Order) => (
        <div>
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Sản phẩm",
      render: (order: Order) => (
        <span className="text-sm">{order.items.length} sản phẩm</span>
      ),
    },
    {
      key: "total",
      label: "Tổng tiền",
      sortable: true,
      render: (order: Order) => (
        <span className="font-medium">
          {order.total.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      render: (order: Order) => {
        const statusMap = {
          pending: { label: "Chờ xử lý", variant: "secondary" as const },
          processing: { label: "Đang xử lý", variant: "default" as const },
          completed: { label: "Hoàn thành", variant: "default" as const },
        }
        const status = statusMap[order.status]
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "createdAt",
      label: "Ngày đặt",
      sortable: true,
      render: (order: Order) => (
        <span className="text-sm">
          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (order: Order) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedOrder(order)
            setDialogOpen(true)
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn hàng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và theo dõi đơn hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        searchPlaceholder="Tìm kiếm đơn hàng..."
      />

      {/* Order Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Họ tên</p>
                      <p className="font-medium">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{selectedOrder.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ngày đặt</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium">{selectedOrder.customer.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Sản phẩm</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">
                              Custom Bracelet - {item.design.templateId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Số lượng: {item.qty}
                            </p>
                            {item.design.engrave && (
                              <p className="text-sm text-muted-foreground">
                                Khắc chữ: &ldquo;{item.design.engrave.text}&rdquo;
                              </p>
                            )}
                          </div>
                          <p className="font-medium">
                            {(item.design.unitPrice * item.qty).toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                        {index < selectedOrder.items.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Tổng cộng</span>
                    <span className="font-bold text-lg">
                      {selectedOrder.total.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Status Update */}
              <div className="flex gap-2">
                <Select
                  defaultValue={selectedOrder.status}
                  onValueChange={(value) => {
                    // Update order status
                    console.log("Update status to:", value)
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Cập nhật trạng thái</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

