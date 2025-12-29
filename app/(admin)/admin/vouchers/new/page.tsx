"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { useToast } from "@/hooks/use-toast"
import dayjs from "dayjs"

export default function NewVoucherPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "Percent" as "Percent" | "Amount",
    discountValue: "",
    maximumDiscountAmount: "",
    minimumOrderAmount: "",
    totalUsageLimit: "",
    usageLimitPerCustomer: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    published: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.accessToken) return

    const accessToken = user.accessToken // Store in const for TypeScript

    if (!formData.code.trim() || !formData.name.trim() || !formData.discountValue) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDateTime = dayjs(`${formData.startDate} ${formData.startTime || "00:00"}`)
      const endDateTime = dayjs(`${formData.endDate} ${formData.endTime || "23:59"}`)
      
      if (endDateTime.isBefore(startDateTime)) {
        toast({
          title: "Lỗi",
          description: "Ngày kết thúc phải sau ngày bắt đầu",
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)
    try {
      // Combine date and time
      let startDateISO = ""
      let endDateISO = ""
      
      if (formData.startDate) {
        const startDateTime = dayjs(`${formData.startDate} ${formData.startTime || "00:00"}`)
        startDateISO = startDateTime.toISOString()
      }
      
      if (formData.endDate) {
        const endDateTime = dayjs(`${formData.endDate} ${formData.endTime || "23:59"}`)
        endDateISO = endDateTime.toISOString()
      }

      const voucherData = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount 
          ? parseFloat(formData.minimumOrderAmount)
          : null,
        maximumDiscountAmount: formData.maximumDiscountAmount
          ? parseFloat(formData.maximumDiscountAmount)
          : null,
        totalUsageLimit: formData.totalUsageLimit
          ? parseInt(formData.totalUsageLimit)
          : null,
        usageLimitPerCustomer: formData.usageLimitPerCustomer
          ? parseInt(formData.usageLimitPerCustomer)
          : null,
        startDate: startDateISO || new Date().toISOString(),
        endDate: endDateISO || new Date().toISOString(),
        published: formData.published,
      }

      await adminApi.vouchers.create(accessToken, voucherData)
      toast({
        title: "Thành công",
        description: "Đã tạo mã giảm giá mới",
      })
      router.push("/admin/vouchers")
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo mã giảm giá",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tạo mã giảm giá mới</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã giảm giá *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SALE500K"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên hiển thị *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Giảm 500.000₫ mọi đơn hàng"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả về mã giảm giá..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Thiết lập giảm giá */}
        <Card>
          <CardHeader>
            <CardTitle>Thiết lập giảm giá</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Loại giảm *</Label>
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
                  <SelectItem value="Amount">Số tiền cố định</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">Giá trị giảm *</Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === "Percent" ? "5" : "50000"}
                required
              />
              {formData.discountType === "Percent" && (
                <p className="text-sm text-muted-foreground">Nhập phần trăm giảm giá (ví dụ: 5 cho 5%)</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maximumDiscountAmount">Giảm tối đa (đơn)</Label>
              <Input
                id="maximumDiscountAmount"
                type="number"
                min="0"
                value={formData.maximumDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: e.target.value })}
                placeholder="100000"
              />
              <p className="text-sm text-muted-foreground">Số tiền giảm tối đa cho mỗi đơn hàng (VNĐ)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumOrderAmount">Giá trị đơn tối thiểu</Label>
              <Input
                id="minimumOrderAmount"
                type="number"
                min="0"
                value={formData.minimumOrderAmount}
                onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                placeholder="300000"
              />
              <p className="text-sm text-muted-foreground">Đơn hàng phải có giá trị tối thiểu để áp dụng voucher (VNĐ)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalUsageLimit">Giới hạn tổng số lần dùng</Label>
              <Input
                id="totalUsageLimit"
                type="number"
                min="0"
                value={formData.totalUsageLimit}
                onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                placeholder="100"
              />
              <p className="text-sm text-muted-foreground">Tổng số lần voucher có thể được sử dụng (để trống = không giới hạn)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageLimitPerCustomer">Giới hạn / khách hàng</Label>
              <Input
                id="usageLimitPerCustomer"
                type="number"
                min="0"
                value={formData.usageLimitPerCustomer}
                onChange={(e) => setFormData({ ...formData, usageLimitPerCustomer: e.target.value })}
                placeholder="1"
              />
              <p className="text-sm text-muted-foreground">Số lần mỗi khách hàng có thể sử dụng voucher này (để trống = không giới hạn)</p>
            </div>
          </CardContent>
        </Card>

        {/* Thời gian hiệu lực & Trạng thái */}
        <Card>
          <CardHeader>
            <CardTitle>Thời gian hiệu lực & Trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Giờ bắt đầu</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Giờ kết thúc</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Public (hiển thị cho khách)</Label>
                <p className="text-sm text-muted-foreground">
                  Bật để hiển thị voucher cho khách hàng
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu voucher"}
          </Button>
        </div>
      </form>
    </div>
  )
}

