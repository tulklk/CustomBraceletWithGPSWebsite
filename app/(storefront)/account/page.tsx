"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/store/useUser"
import { useCustomizer } from "@/store/useCustomizer"
import { useCart } from "@/store/useCart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { 
  Trash2, ShoppingCart, Edit, LogOut, User, Package, 
  MapPin, Save, Heart, Settings, Phone, Mail, Home 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { ordersApi, Order, OrderStatus } from "@/lib/api/orders"

// Map backend status to Vietnamese
const getStatusLabel = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    Pending: "Chờ xử lý",
    Confirmed: "Đã xác nhận",
    Processing: "Đang xử lý",
    Shipped: "Đang giao",
    Delivered: "Đã giao",
    Cancelled: "Đã hủy",
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" => {
  if (status === "Delivered") return "default"
  if (status === "Cancelled") return "destructive"
  return "secondary"
}

export default function AccountPage() {
  const { user, logout, removeDesign, makeAuthenticatedRequest } = useUser()
  const { setTemplate, setColor, setEngrave } = useCustomizer()
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("overview")
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  
  // User profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "0123456789",
    address: "123 Nguyễn Văn Linh, Q7, TP.HCM",
  })

  // Check if we should open orders tab from URL
  useEffect(() => {
    const orderId = searchParams?.get("order")
    if (orderId) {
      setActiveTab("orders")
    }
  }, [searchParams])

  // Fetch orders when user is logged in and orders tab is active
  useEffect(() => {
    if (user?.accessToken && activeTab === "orders") {
      fetchOrders()
    }
  }, [user?.accessToken, activeTab])

  const fetchOrders = async () => {
    if (!user?.accessToken) return

    setLoadingOrders(true)
    try {
      const fetchedOrders = await makeAuthenticatedRequest(async (token) => {
        return await ordersApi.getMyOrders(
          token,
          user.refreshToken,
          (newToken) => {
            // Token refresh handled by makeAuthenticatedRequest
          }
        )
      })
      setOrders(fetchedOrders)
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Lỗi khi tải đơn hàng",
        description: error.message || "Vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setLoadingOrders(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Chưa đăng nhập</h1>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để xem thông tin tài khoản
          </p>
          <p className="text-sm text-muted-foreground">
            (Nhấn nút &quot;Đăng nhập&quot; ở góc trên phải)
          </p>
        </div>
      </div>
    )
  }

  const handleBuyAgain = (designIndex: number) => {
    const design = user.savedDesigns[designIndex]
    addItem(design)
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: "Xem giỏ hàng để thanh toán",
    })
  }

  const handleEdit = (designIndex: number) => {
    const design = user.savedDesigns[designIndex]
    // Load design to customizer (need to navigate to product page)
    toast({
      title: "Đang tải thiết kế...",
      description: "Chuyển đến trang tùy chỉnh",
    })
    // In real app, would navigate to /products/[slug] with design loaded
    router.push(`/products/${design.productId}`)
  }

  const handleDelete = (index: number) => {
    removeDesign(index)
    toast({
      title: "Đã xóa thiết kế",
    })
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Đã đăng xuất",
    })
    router.push("/")
  }

  const handleSaveProfile = () => {
    toast({
      title: "Đã lưu thông tin!",
      description: "Thông tin tài khoản đã được cập nhật",
    })
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Tài khoản của tôi</h1>
            <p className="text-muted-foreground">
              Xin chào, <span className="font-semibold">{user.name}</span>
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Đơn hàng</span>
            </TabsTrigger>
            <TabsTrigger value="designs" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Thiết kế</span>
            </TabsTrigger>
            <TabsTrigger value="address" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Địa chỉ</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Cài đặt</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground">Tổng số đơn</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Thiết kế đã lưu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.savedDesigns.length}</div>
                  <p className="text-xs text-muted-foreground">Designs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Tổng chi tiêu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">VNĐ</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Số điện thoại</p>
                    <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Địa chỉ</p>
                    <p className="text-sm text-muted-foreground">{profileData.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Đơn hàng của tôi</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchOrders}
                    disabled={loadingOrders}
                  >
                    {loadingOrders ? "Đang tải..." : "Làm mới"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Đang tải đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào</p>
                    <Button onClick={() => router.push("/products")}>
                      Mua sắm ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN")
                      return (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold">
                                    {order.orderNumber || order.id}
                                  </span>
                                  <Badge variant={getStatusVariant(order.status)}>
                                    {getStatusLabel(order.status)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Ngày đặt: {orderDate}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.items.length} sản phẩm
                                </p>
                                {order.shippingAddress && (
                                  <p className="text-xs text-muted-foreground">
                                    Giao đến: {order.shippingAddress.fullName} - {order.shippingAddress.phoneNumber}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col justify-between items-end gap-2">
                                <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    // Could navigate to order detail page
                                    toast({
                                      title: "Chi tiết đơn hàng",
                                      description: `Đơn hàng ${order.orderNumber || order.id}`,
                                    })
                                  }}
                                >
                                  Xem chi tiết
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Designs Tab */}
          <TabsContent value="designs" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Thiết kế đã lưu ({user.savedDesigns.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {user.savedDesigns.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Bạn chưa lưu thiết kế nào
                    </p>
                    <Button onClick={() => router.push("/products")}>
                      Bắt đầu thiết kế
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.savedDesigns.map((design, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <div className="text-6xl">🎨</div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{design.templateId}</Badge>
                              {design.engrave && (
                                <Badge variant="secondary">Khắc tên</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {design.engrave?.text && `"${design.engrave.text}"`}
                            </p>
                            {design.accessories.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {design.accessories.length} phụ kiện
                              </p>
                            )}
                          </div>

                          <p className="font-bold text-lg text-primary">
                            {formatCurrency(design.unitPrice)}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleBuyAgain(index)}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Mua
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(index)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Địa chỉ giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="border-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{profileData.name}</p>
                          <Badge>Mặc định</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                        <p className="text-sm">{profileData.address}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Sửa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Button variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Thêm địa chỉ mới
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

