"use client"

import { useState, useEffect } from "react"
import { StatsCard } from "@/components/admin/StatsCard"
import { DataTable } from "@/components/admin/DataTable"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Tags,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminOrder, AdminReport, ORDER_STATUS_MAP } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

function getAdminOrderCustomerDisplay(order: AdminOrder): string {
  return (
    order.customerName ||
    order.userFullName ||
    order.guestFullName ||
    order.customerEmail ||
    order.userEmail ||
    order.guestEmail ||
    "N/A"
  )
}

function getAdminOrderCodeDisplay(order: AdminOrder): string {
  return order.orderCode || order.orderNumber || "N/A"
}

function getAdminOrderStatusLabel(order: AdminOrder): string {
  // Prefer numeric status from API
  if (typeof order.orderStatus === "number") {
    const match = Object.values(ORDER_STATUS_MAP).find((s) => s.value === order.orderStatus)
    if (match?.label) return match.label
  }

  // Fallback to legacy string field
  return order.status || "N/A"
}

export default function AdminDashboard() {
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminReport | null>(null)
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Read auth from localStorage directly to avoid state loops
        const authRaw = typeof window !== 'undefined' ? localStorage.getItem('artemis-user') : null
        const authData = authRaw ? JSON.parse(authRaw) : {}
        const token = authData.accessToken

        if (!token) {
          console.warn("[AdminDashboard] Access token missing in localStorage")
          setLoading(false)
          return
        }

        const [reportData, ordersData] = await Promise.all([
          adminApi.reports.getStats(token),
          adminApi.orders.getAll(token),
        ])

        setStats(reportData)

        const sortedOrders = ordersData
          .filter((order): order is AdminOrder & { createdAt: string } => !!order.createdAt)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return dateB - dateA
          })
          .slice(0, 5)
        setRecentOrders(sortedOrders)
      } catch (error: any) {
        console.error("[AdminDashboard] Fetch error:", error)
        toast({
          title: "Lỗi dữ liệu",
          description: "Không thể lấy thông tin từ hệ thống. Thử đăng nhập lại.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const orderColumns = [
    {
      key: "orderCode",
      label: "Mã đơn",
      sortable: true,
      render: (order: AdminOrder) => getAdminOrderCodeDisplay(order),
    },
    {
      key: "customerName",
      label: "Khách hàng",
      sortable: true,
      render: (order: AdminOrder) => getAdminOrderCustomerDisplay(order),
    },
    {
      key: "totalAmount",
      label: "Tổng tiền",
      sortable: true,
      render: (order: AdminOrder) => (
        <span className="font-medium">
          {formatCurrency(order.totalAmount || 0)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (order: AdminOrder) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
          "Đang xử lý": { label: "Đang xử lý", variant: "default" },
          "Đã xác nhận": { label: "Đã xác nhận", variant: "default" },
          "Đang chuẩn bị": { label: "Đang chuẩn bị", variant: "default" },
          "Đã giao hàng": { label: "Đã giao hàng", variant: "default" },
          "Hoàn thành": { label: "Hoàn thành", variant: "default" },
          "Đã hủy": { label: "Đã hủy", variant: "destructive" },
        }
        const orderStatus = getAdminOrderStatusLabel(order)
        const status = statusMap[orderStatus] || { label: orderStatus, variant: "secondary" as const }
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "createdAt",
      label: "Ngày đặt",
      sortable: true,
      render: (order: AdminOrder) => {
        if (!order.createdAt) return "N/A"
        const date = new Date(order.createdAt)
        return date.toLocaleDateString("vi-VN")
      },
    },
  ]

  // Check auth for UI indicators
  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('artemis-user') : null
  const authData = authRaw ? JSON.parse(authRaw) : {}
  const hasToken = !!authData.accessToken

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          {!hasToken && (
            <p className="text-xs text-red-400 mt-4">Cảnh báo: Không tìm thấy Access Token</p>
          )}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground text-center">
          Không có dữ liệu hiển thị. <br />
          {hasToken ? "Vui lòng kiểm tra lại quyền truy cập của tài khoản." : "Vui lòng đăng nhập lại."}
        </p>
        <Button onClick={() => window.location.reload()}>
          Tải lại trang
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">BẢNG ĐIỀU KHIỂN</h1>
        <p className="text-muted-foreground mt-2">
          Xin chào, {user?.fullName || user?.name || "Admin"}
        </p>
        <p className="text-sm text-yellow-500/80 mt-1">
          {hasToken ? "Đã kết nối với hệ thống" : "Chưa đăng nhập"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/admin/orders">Quản lý đơn hàng</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Thêm sản phẩm mới</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Doanh thu toàn thời gian"
          value={formatCurrency(stats.totalRevenue)}
          description={`${stats.totalOrders} đơn trong hệ thống`}
          icon={DollarSign}
        />
        <StatsCard
          title="Đơn hàng đang xử lý"
          value={stats.totalOrders.toString()}
          description={`${stats.totalOrders} đơn trong hệ thống`}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Sản phẩm đang kinh doanh"
          value={stats.totalProducts.toString()}
          description={`${stats.totalProducts} sản phẩm`}
          icon={Package}
        />
        <StatsCard
          title="Danh mục"
          value={stats.totalCategories.toString()}
          description="Tạo thêm danh mục để tổ chức sản phẩm"
          icon={Tags}
        />
      </div>

      {/* Revenue Chart */}
      {stats.dailyRevenue && stats.dailyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Xem xu hướng doanh thu theo ngày, tuần, quý hoặc năm.
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-lg font-semibold">
                Tổng doanh thu: {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })
                    }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value: any) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(Number(value)),
                      'Doanh thu'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("vi-VN")
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">Xem tất cả</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có đơn hàng nào
            </div>
          ) : (
            <DataTable
              data={recentOrders}
              columns={orderColumns}
              searchable={false}
              pageSize={5}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
