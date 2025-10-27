"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Save, Upload } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Đã lưu",
        description: "Cài đặt đã được cập nhật thành công",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý cài đặt hệ thống và cửa hàng
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="shop">Cửa hàng</TabsTrigger>
          <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>
                Thông tin cơ bản về cửa hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="storeName">Tên cửa hàng</Label>
                <Input
                  id="storeName"
                  defaultValue="ARTEMIS Bracelets"
                  placeholder="Tên cửa hàng"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storeEmail">Email liên hệ</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  defaultValue="contact@artemis.com"
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storePhone">Số điện thoại</Label>
                <Input
                  id="storePhone"
                  defaultValue="1900-xxxx"
                  placeholder="Số điện thoại"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storeAddress">Địa chỉ</Label>
                <Textarea
                  id="storeAddress"
                  defaultValue="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                  placeholder="Địa chỉ cửa hàng"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
              <CardDescription>
                Tùy chỉnh hình ảnh thương hiệu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-accent rounded flex items-center justify-center">
                    <span className="text-2xl font-bold">A</span>
                  </div>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Tải lên logo mới
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shop Settings */}
        <TabsContent value="shop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt cửa hàng</CardTitle>
              <CardDescription>
                Quản lý các tùy chọn hiển thị và hoạt động
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chế độ bảo trì</Label>
                  <p className="text-sm text-muted-foreground">
                    Tạm dừng hoạt động cửa hàng
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cho phép đặt hàng</Label>
                  <p className="text-sm text-muted-foreground">
                    Khách hàng có thể đặt hàng
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hiển thị live chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Bật/tắt widget chat hỗ trợ
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="maxCharms">Số lượng charm tối đa</Label>
                <Input
                  id="maxCharms"
                  type="number"
                  defaultValue="12"
                  placeholder="12"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="engraveFee">Phí khắc chữ (VND)</Label>
                <Input
                  id="engraveFee"
                  type="number"
                  defaultValue="50000"
                  placeholder="50000"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt vận chuyển</CardTitle>
              <CardDescription>
                Quản lý phương thức và phí vận chuyển
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Miễn phí vận chuyển</Label>
                  <p className="text-sm text-muted-foreground">
                    Cho đơn hàng trên 500,000₫
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="shippingFee">Phí vận chuyển cơ bản (VND)</Label>
                <Input
                  id="shippingFee"
                  type="number"
                  defaultValue="30000"
                  placeholder="30000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="freeShippingThreshold">
                  Ngưỡng miễn phí vận chuyển (VND)
                </Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  defaultValue="500000"
                  placeholder="500000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedDays">
                  Thời gian giao hàng dự kiến (ngày)
                </Label>
                <Input
                  id="estimatedDays"
                  defaultValue="3-5 ngày"
                  placeholder="3-5 ngày"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
              <CardDescription>
                Cấu hình các phương thức thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thanh toán khi nhận hàng (COD)</Label>
                  <p className="text-sm text-muted-foreground">
                    Cho phép thanh toán COD
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chuyển khoản ngân hàng</Label>
                  <p className="text-sm text-muted-foreground">
                    Thanh toán qua chuyển khoản
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>VNPay</Label>
                  <p className="text-sm text-muted-foreground">
                    Cổng thanh toán VNPay
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="bankName">Tên ngân hàng</Label>
                <Input
                  id="bankName"
                  defaultValue="Vietcombank"
                  placeholder="Vietcombank"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bankAccount">Số tài khoản</Label>
                <Input
                  id="bankAccount"
                  defaultValue="1234567890"
                  placeholder="Số tài khoản"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountHolder">Chủ tài khoản</Label>
                <Input
                  id="accountHolder"
                  defaultValue="ARTEMIS COMPANY"
                  placeholder="Tên chủ tài khoản"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  )
}

