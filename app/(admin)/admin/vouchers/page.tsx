"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminVoucher } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import "dayjs/locale/vi"
dayjs.locale("vi")

export default function VouchersPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!user?.accessToken) return
    fetchVouchers()
  }, [user?.accessToken])

  const fetchVouchers = async () => {
    if (!user?.accessToken) return
    const accessToken = user.accessToken // Store in const for TypeScript
    try {
      setLoading(true)
      const data = await adminApi.vouchers.getAll(accessToken)
      setVouchers(data)
    } catch (error: any) {
      console.error("Error fetching vouchers:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải mã giảm giá",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast({
        title: "Đã sao chép",
        description: `Đã sao chép mã "${code}" vào clipboard`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép mã",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!user?.accessToken) return
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return

    const accessToken = user.accessToken // Store in const for TypeScript

    try {
      await adminApi.vouchers.delete(accessToken, id)
      toast({
        title: "Thành công",
        description: "Đã xóa mã giảm giá",
      })
      fetchVouchers()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa mã giảm giá",
        variant: "destructive",
      })
    }
  }


  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && voucher.published) ||
      (statusFilter === "hidden" && !voucher.published)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QUẢN LÝ KHUYẾN MÃI</h1>
          <p className="text-muted-foreground mt-1">
            Mã giảm giá - Danh sách mã giảm giá đang áp dụng cho cửa hàng.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/vouchers/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo mã giảm giá
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>TÌM KIẾM VOUCHER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tìm theo mã, tên voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === "published" ? "default" : "outline"}
              onClick={() => setStatusFilter("published")}
            >
              Đang public
            </Button>
            <Button
              variant={statusFilter === "hidden" ? "default" : "outline"}
              onClick={() => setStatusFilter("hidden")}
            >
              Đang ẩn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Loại giảm</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Đơn tối thiểu</TableHead>
                <TableHead>Tối đa giảm</TableHead>
                <TableHead>Hiệu lực</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "Không tìm thấy mã giảm giá nào"
                      : "Chưa có mã giảm giá nào"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {voucher.code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyCode(voucher.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{voucher.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {voucher.discountType === "Percent" ? "% Percent" : "% Amount"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {voucher.discountType === "Percent"
                        ? `${voucher.discountValue}%`
                        : formatCurrency(voucher.discountValue)}
                    </TableCell>
                    <TableCell>
                      {voucher.minimumOrderAmount
                        ? formatCurrency(voucher.minimumOrderAmount)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {voucher.maximumDiscountAmount
                        ? formatCurrency(voucher.maximumDiscountAmount)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {voucher.startDate && voucher.endDate ? (
                        <div>
                          <p>Từ: {dayjs(voucher.startDate).format("DD [tháng] MM, YYYY")}</p>
                          <p>Đến: {dayjs(voucher.endDate).format("DD [tháng] MM, YYYY")}</p>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={voucher.published ? "default" : "secondary"}
                        className={voucher.published ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {voucher.published ? "Đang public" : "Đang ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/vouchers/${voucher.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}

