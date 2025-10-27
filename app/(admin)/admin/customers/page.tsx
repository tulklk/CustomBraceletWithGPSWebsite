"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Mail, Phone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

// Mock customer data
const mockCustomers = [
  {
    id: "CUS-001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    totalOrders: 5,
    totalSpent: 12500000,
    status: "active",
    joinedAt: "2024-01-10",
  },
  {
    id: "CUS-002",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0902345678",
    totalOrders: 3,
    totalSpent: 5700000,
    status: "active",
    joinedAt: "2024-01-12",
  },
  {
    id: "CUS-003",
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0903456789",
    totalOrders: 8,
    totalSpent: 19800000,
    status: "vip",
    joinedAt: "2023-12-20",
  },
  {
    id: "CUS-004",
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    phone: "0904567890",
    totalOrders: 1,
    totalSpent: 1950000,
    status: "new",
    joinedAt: "2024-01-18",
  },
  {
    id: "CUS-005",
    name: "Hoàng Văn E",
    email: "hoangvane@email.com",
    phone: "0905678901",
    totalOrders: 12,
    totalSpent: 28500000,
    status: "vip",
    joinedAt: "2023-11-05",
  },
]

export default function CustomersPage() {
  const [customers] = useState(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const columns = [
    {
      key: "id",
      label: "Mã KH",
      sortable: true,
      render: (customer: any) => (
        <span className="font-mono font-medium">{customer.id}</span>
      ),
    },
    {
      key: "name",
      label: "Tên khách hàng",
      sortable: true,
      render: (customer: any) => (
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-xs text-muted-foreground">{customer.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Số điện thoại",
      render: (customer: any) => (
        <span className="text-sm">{customer.phone}</span>
      ),
    },
    {
      key: "totalOrders",
      label: "Đơn hàng",
      sortable: true,
      render: (customer: any) => (
        <span className="font-medium">{customer.totalOrders}</span>
      ),
    },
    {
      key: "totalSpent",
      label: "Tổng chi tiêu",
      sortable: true,
      render: (customer: any) => (
        <span className="font-medium">
          {customer.totalSpent.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      render: (customer: any) => {
        const statusMap = {
          new: { label: "Mới", variant: "secondary" as const },
          active: { label: "Hoạt động", variant: "default" as const },
          vip: { label: "VIP", variant: "default" as const },
        }
        const status = statusMap[customer.status as keyof typeof statusMap]
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "joinedAt",
      label: "Ngày tham gia",
      sortable: true,
      render: (customer: any) => (
        <span className="text-sm">
          {new Date(customer.joinedAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (customer: any) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedCustomer(customer)
            setDialogOpen(true)
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khách hàng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý thông tin khách hàng
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng khách hàng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.status === "new").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Khách hàng mới
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.status === "vip").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Khách VIP
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ₫{(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng doanh thu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Tìm kiếm khách hàng..."
      />

      {/* Customer Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin khách hàng</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Mã khách hàng</p>
                      <p className="font-medium">{selectedCustomer.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Trạng thái</p>
                      <div className="mt-1">
                        <Badge>
                          {selectedCustomer.status === "new" && "Mới"}
                          {selectedCustomer.status === "active" && "Hoạt động"}
                          {selectedCustomer.status === "vip" && "VIP"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Họ tên</p>
                      <p className="font-medium">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ngày tham gia</p>
                      <p className="font-medium">
                        {new Date(selectedCustomer.joinedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedCustomer.email}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedCustomer.phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Stats */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Thống kê mua hàng</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tổng đơn hàng</p>
                      <p className="font-bold text-2xl">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tổng chi tiêu</p>
                      <p className="font-bold text-2xl">
                        {(selectedCustomer.totalSpent / 1000000).toFixed(1)}M ₫
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Giá trị trung bình</p>
                      <p className="font-medium">
                        {(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString("vi-VN")} ₫
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Gọi điện
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

