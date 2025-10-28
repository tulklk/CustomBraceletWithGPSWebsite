"use client"

import { StatsCard } from "@/components/admin/StatsCard"
import { DataTable } from "@/components/admin/DataTable"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Mock data
const recentOrders = [
  {
    id: "ORD-001",
    customer: "Nguyễn Văn A",
    total: 2450000,
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Trần Thị B",
    total: 1850000,
    status: "processing",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "Lê Văn C",
    total: 3200000,
    status: "completed",
    date: "2024-01-14",
  },
  {
    id: "ORD-004",
    customer: "Phạm Thị D",
    total: 1950000,
    status: "processing",
    date: "2024-01-14",
  },
  {
    id: "ORD-005",
    customer: "Hoàng Văn E",
    total: 2750000,
    status: "completed",
    date: "2024-01-13",
  },
]

const topProducts = [
  { name: "ARTEMIS Bunny Baby Pink", sales: 156, revenue: 62400000 },
  { name: "ARTEMIS Bunny Lavender", sales: 89, revenue: 35600000 },
  { name: "ARTEMIS Dây Chuyền Bunny Baby Pink", sales: 67, revenue: 10050000 },
]

// Dữ liệu doanh thu theo tháng (VNĐ)
const monthlyRevenue = [
  { month: "T1", revenue: 28500000 },
  { month: "T2", revenue: 32100000 },
  { month: "T3", revenue: 35400000 },
  { month: "T4", revenue: 38900000 },
  { month: "T5", revenue: 41200000 },
  { month: "T6", revenue: 39800000 },
  { month: "T7", revenue: 43500000 },
  { month: "T8", revenue: 46200000 },
  { month: "T9", revenue: 44100000 },
  { month: "T10", revenue: 48300000 },
  { month: "T11", revenue: 52600000 },
  { month: "T12", revenue: 45200000 },
]

export default function AdminDashboard() {
  const orderColumns = [
    {
      key: "id",
      label: "Mã đơn",
      sortable: true,
    },
    {
      key: "customer",
      label: "Khách hàng",
      sortable: true,
    },
    {
      key: "total",
      label: "Tổng tiền",
      sortable: true,
      render: (order: any) => (
        <span className="font-medium">
          {order.total.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (order: any) => {
        const statusMap = {
          pending: { label: "Chờ xử lý", variant: "secondary" as const },
          processing: { label: "Đang xử lý", variant: "default" as const },
          completed: { label: "Hoàn thành", variant: "default" as const },
        }
        const status = statusMap[order.status as keyof typeof statusMap]
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "date",
      label: "Ngày đặt",
      sortable: true,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Tổng quan hoạt động kinh doanh của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng doanh thu"
          value="₫45.2M"
          description="Tháng này"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Đơn hàng"
          value="312"
          description="Tổng số đơn hàng"
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Sản phẩm"
          value="48"
          description="Đang hoạt động"
          icon={Package}
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatsCard
          title="Khách hàng"
          value="1,234"
          description="Tổng khách hàng"
          icon={Users}
          trend={{ value: 15.3, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value: any) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString('vi-VN')} ₫`,
                      'Doanh thu'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales} đơn hàng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {(product.revenue / 1000000).toFixed(1)}M ₫
                    </p>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="text-xs">
                        {((product.sales / 312) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">Xem tất cả</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recentOrders}
            columns={orderColumns}
            searchable={false}
            pageSize={5}
          />
        </CardContent>
      </Card>
    </div>
  )
}

