"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
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
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discountType: "Percent" as "Percent" | "Amount",
    discountValue: "",
    minimumOrderAmount: "",
    maximumDiscountAmount: "",
    startDate: "",
    endDate: "",
    published: false,
  })

  useEffect(() => {
    if (!user?.accessToken) return
    fetchVouchers()
  }, [user?.accessToken])

  const fetchVouchers = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const data = await adminApi.vouchers.getAll(user.accessToken)
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

  const handleOpenDialog = (voucher?: AdminVoucher) => {
    if (voucher) {
      setEditingVoucher(voucher)
      setFormData({
        code: voucher.code || "",
        name: voucher.name || "",
        discountType: voucher.discountType || "Percent",
        discountValue: voucher.discountValue.toString() || "",
        minimumOrderAmount: voucher.minimumOrderAmount?.toString() || "",
        maximumDiscountAmount: voucher.maximumDiscountAmount?.toString() || "",
        startDate: voucher.startDate ? dayjs(voucher.startDate).format("YYYY-MM-DD") : "",
        endDate: voucher.endDate ? dayjs(voucher.endDate).format("YYYY-MM-DD") : "",
        published: voucher.published || false,
      })
    } else {
      setEditingVoucher(null)
      setFormData({
        code: "",
        name: "",
        discountType: "Percent",
        discountValue: "",
        minimumOrderAmount: "",
        maximumDiscountAmount: "",
        startDate: "",
        endDate: "",
        published: false,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingVoucher(null)
    setFormData({
      code: "",
      name: "",
      discountType: "Percent",
      discountValue: "",
      minimumOrderAmount: "",
      maximumDiscountAmount: "",
      startDate: "",
      endDate: "",
      published: false,
    })
  }

  const handleSubmit = async () => {
    if (!user?.accessToken) return
    if (!formData.code.trim() || !formData.name.trim() || !formData.discountValue) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    try {
      const voucherData = {
        code: formData.code,
        name: formData.name,
        discountType: formData.discountType,
        discountValue: formData.discountType === "Percent" 
          ? parseFloat(formData.discountValue)
          : parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount 
          ? parseFloat(formData.minimumOrderAmount)
          : null,
        maximumDiscountAmount: formData.maximumDiscountAmount
          ? parseFloat(formData.maximumDiscountAmount)
          : null,
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date().toISOString(),
        published: formData.published,
      }

      if (editingVoucher) {
        await adminApi.vouchers.update(user.accessToken, editingVoucher.id, voucherData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật mã giảm giá",
        })
      } else {
        await adminApi.vouchers.create(user.accessToken, voucherData)
        toast({
          title: "Thành công",
          description: "Đã tạo mã giảm giá mới",
        })
      }
      handleCloseDialog()
      fetchVouchers()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu mã giảm giá",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!user?.accessToken) return
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return

    try {
      await adminApi.vouchers.delete(user.accessToken, id)
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

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    if (!user?.accessToken) return
    try {
      if (!currentPublished) {
        await adminApi.vouchers.publish(user.accessToken, id)
        toast({
          title: "Thành công",
          description: "Đã publish mã giảm giá",
        })
      } else {
        await adminApi.vouchers.update(user.accessToken, id, { published: false })
        toast({
          title: "Thành công",
          description: "Đã ẩn mã giảm giá",
        })
      }
      fetchVouchers()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
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
        <Button onClick={() => handleOpenDialog()}>
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
                    <TableCell className="font-medium">{voucher.code}</TableCell>
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
                      <Badge variant={voucher.published ? "default" : "secondary"}>
                        {voucher.published ? "Đang public" : "Đang ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(voucher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(voucher.id, voucher.published)}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVoucher ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </DialogTitle>
            <DialogDescription>
              {editingVoucher
                ? "Cập nhật thông tin mã giảm giá"
                : "Tạo mã giảm giá mới cho cửa hàng"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SALE500K"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Giảm 500.000₫ mọi đơn hàng"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Loại giảm</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: "Percent" | "Amount") =>
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="Amount">Số tiền (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">Giá trị *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === "Percent" ? "5" : "50000"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount">Đơn tối thiểu</Label>
                <Input
                  id="minimumOrderAmount"
                  type="number"
                  value={formData.minimumOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minimumOrderAmount: e.target.value })
                  }
                  placeholder="300000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maximumDiscountAmount">Tối đa giảm</Label>
                <Input
                  id="maximumDiscountAmount"
                  type="number"
                  value={formData.maximumDiscountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, maximumDiscountAmount: e.target.value })
                  }
                  placeholder="100000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Từ ngày</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Đến ngày</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="published">Trạng thái</Label>
              <Select
                value={formData.published ? "published" : "hidden"}
                onValueChange={(value) =>
                  setFormData({ ...formData, published: value === "published" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hidden">Đang ẩn</SelectItem>
                  <SelectItem value="published">Đang public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingVoucher ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

