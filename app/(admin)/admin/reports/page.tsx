"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { AdminReport } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Package } from "lucide-react"
import dayjs from "dayjs"
import "dayjs/locale/vi"
dayjs.locale("vi")

export default function ReportsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<AdminReport | null>(null)
  const [startDate, setStartDate] = useState(
    dayjs().subtract(10, "days").format("YYYY-MM-DD")
  )
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"))

  useEffect(() => {
    if (!user?.accessToken) return
    fetchReport()
  }, [user?.accessToken, startDate, endDate])

  const fetchReport = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const data = await adminApi.reports.getStats(
        user.accessToken,
        startDate,
        endDate
      )
      setReport(data)
    } catch (error: any) {
      console.error("Error fetching report:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải báo cáo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilter = () => {
    fetchReport()
  }

  const handleResetFilter = () => {
    setStartDate(dayjs().subtract(10, "days").format("YYYY-MM-DD"))
    setEndDate(dayjs().format("YYYY-MM-DD"))
  }

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
        <h1 className="text-3xl font-bold">DASHBOARD / ADMIN</h1>
        <p className="text-muted-foreground mt-1">
          Admin · Báo cáo & Thống kê
        </p>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Lọc theo thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleApplyFilter}>Áp dụng</Button>
            <Button variant="outline" onClick={handleResetFilter}>
              Đặt lại
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      {report && report.dailyRevenue && report.dailyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo ngày</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Biểu đồ thể hiện doanh thu theo thời gian.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "currentColor" }}
                    tickFormatter={(value) => {
                      return dayjs(value).format("DD-MM")
                    }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor" }}
                    tickFormatter={(value: any) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatCurrency(Number(value)),
                      "Doanh thu",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelFormatter={(value) => {
                      return dayjs(value).format("DD/MM/YYYY")
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      {report && report.topProducts && report.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo sản phẩm</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Top sản phẩm mang lại doanh thu cao nhất.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {report.topProducts.map((product, index) => (
                <Card key={index} className="min-w-[200px]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <p className="font-medium text-sm mb-1 line-clamp-2">
                      {product.productName}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(product.revenue)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

