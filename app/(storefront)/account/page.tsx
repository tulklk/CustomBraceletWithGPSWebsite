"use client"

import { useState, useEffect, useRef, Suspense } from "react"
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
import { formatCurrency } from "@/lib/utils"
import { 
  Trash2, ShoppingCart, Edit, LogOut, User, Package, 
  MapPin, Save, Heart, Settings, Phone, Mail, Home, Lock, ShieldCheck, Upload, Loader2, X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { ordersApi, Order, OrderStatus } from "@/lib/api/orders"
import { useUserProfile } from "@/hooks/useUserProfile"
import { useUpdateProfile } from "@/hooks/useUpdateProfile"
import { useChangePassword } from "@/hooks/useChangePassword"
import { UpdateProfileRequest, ChangePasswordRequest } from "@/types/user"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { provincesApi, Province, Ward } from "@/lib/api/provinces"
import { useAddresses, Address } from "@/store/useAddresses"
import Image from "next/image"

// Convert orderStatus number to OrderStatus string
// 0: Pending, 1: Paid/Confirmed, 2: Processing, 3: Shipped, 4: Delivered, 5: Cancelled
const convertOrderStatus = (orderStatus: number): OrderStatus => {
  const statusMap: Record<number, OrderStatus> = {
    0: "Pending",
    1: "Confirmed",
    2: "Processing",
    3: "Shipped",
    4: "Delivered",
    5: "Cancelled",
  }
  return statusMap[orderStatus] || "Pending"
}

// Get status from order (use status if available, otherwise convert from orderStatus)
const getOrderStatus = (order: Order): OrderStatus => {
  return order.status || convertOrderStatus(order.orderStatus)
}

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

// Component to handle search params (needs Suspense boundary)
function AccountPageContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const searchParams = useSearchParams()
  
  // Check if we should open orders tab from URL
  useEffect(() => {
    const orderId = searchParams?.get("order")
    if (orderId) {
      setActiveTab("orders")
    }
  }, [searchParams, setActiveTab])
  
  return null
}

export default function AccountPage() {
  const { user, logout, removeDesign, makeAuthenticatedRequest } = useUser()
  const { setTemplate, setColor, setEngrave } = useCustomizer()
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  
  // User profile hooks
  const { profile, loading: loadingProfile, error: profileError, refetch: refetchProfile } = useUserProfile()
  const { updateProfile, loading: updatingProfile, error: updateError } = useUpdateProfile()
  const { changePassword, loading: changingPassword, error: passwordError } = useChangePassword()
  
  // Edit mode states
  const [editMode, setEditMode] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Address management
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses()
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)
  const [addressForm, setAddressForm] = useState({
    fullName: profile?.fullName || user?.name || "",
    phoneNumber: profile?.phoneNumber || user?.phoneNumber || "",
    addressLine: "",
    ward: "",
    city: "",
  })
  
  // Form states
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: "",
    phoneNumber: "",
    avatar: null,
  })
  
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
  })
  
  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        avatar: profile.avatar || null,
      })
      setAddressForm({
        fullName: profile.fullName || user?.name || "",
        phoneNumber: profile.phoneNumber || user?.phoneNumber || "",
        addressLine: "",
        ward: "",
        city: "",
      })
    }
  }, [profile, user])

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const fetchedProvinces = await provincesApi.getProvinces()
        setProvinces(fetchedProvinces)
      } catch (error) {
        console.error("Error fetching provinces:", error)
        toast({
          title: "Lỗi khi tải danh sách tỉnh/thành phố",
          description: "Vui lòng thử lại sau",
          variant: "destructive",
        })
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [])

  // Handle province change - load wards
  const handleProvinceChange = async (provinceCode: string) => {
    setAddressForm({ ...addressForm, city: provinceCode, ward: "" })
    setWards([])

    if (!provinceCode) return

    setLoadingWards(true)
    try {
      const fetchedWards = await provincesApi.getWardsByProvince(provinceCode)
      setWards(fetchedWards)
    } catch (error) {
      console.error("Error fetching wards:", error)
      toast({
        title: "Lỗi khi tải danh sách phường/xã",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setLoadingWards(false)
    }
  }


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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await updateProfile(formData)
    if (success) {
      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin tài khoản đã được cập nhật",
      })
      setEditMode(false)
      refetchProfile()
    } else {
      toast({
        title: "Cập nhật thất bại",
        description: updateError || "Vui lòng thử lại sau",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await changePassword(passwordData)
    if (success) {
      toast({
        title: "Đổi mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được cập nhật",
      })
      setPasswordData({ currentPassword: "", newPassword: "" })
      setShowPasswordForm(false)
    } else {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: passwordError || "Vui lòng kiểm tra lại mật khẩu hiện tại",
        variant: "destructive",
      })
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước ảnh không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "File phải là ảnh",
        variant: "destructive",
      })
      return
    }

    setUploadingAvatar(true)
    try {
      const result = await uploadImageToCloudinary(file)
      setFormData({ ...formData, avatar: result.secure_url })
      toast({
        title: "Upload thành công!",
        description: "Ảnh avatar đã được upload",
      })
    } catch (error: any) {
      toast({
        title: "Upload thất bại",
        description: error.message || "Không thể upload ảnh",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatar: null })
  }

  const handleAddAddress = () => {
    if (!addressForm.fullName || !addressForm.phoneNumber || !addressForm.addressLine || !addressForm.ward || !addressForm.city) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    const selectedProvince = provinces.find(p => String(p.code) === addressForm.city)
    const selectedWard = wards.find(w => String(w.code) === addressForm.ward)

    if (editingAddress) {
      // Update existing address
      updateAddress(editingAddress.id, {
        fullName: addressForm.fullName,
        phoneNumber: addressForm.phoneNumber,
        addressLine: addressForm.addressLine,
        ward: addressForm.ward,
        wardName: selectedWard?.name,
        city: addressForm.city,
        cityName: selectedProvince?.name,
      })
      toast({
        title: "Thành công",
        description: "Đã cập nhật địa chỉ",
      })
    } else {
      // Add new address
      addAddress({
        fullName: addressForm.fullName,
        phoneNumber: addressForm.phoneNumber,
        addressLine: addressForm.addressLine,
        ward: addressForm.ward,
        wardName: selectedWard?.name,
        city: addressForm.city,
        cityName: selectedProvince?.name,
      })
      toast({
        title: "Thành công",
        description: "Đã thêm địa chỉ mới",
      })
    }

    setShowAddressDialog(false)
    setEditingAddress(null)
    setAddressForm({
      fullName: profile?.fullName || user?.name || "",
      phoneNumber: profile?.phoneNumber || user?.phoneNumber || "",
      addressLine: "",
      ward: "",
      city: "",
    })
    setWards([])
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine: address.addressLine,
      ward: address.ward,
      city: address.city,
    })
    // Load wards for the selected city
    if (address.city) {
      handleProvinceChange(address.city)
    }
    setShowAddressDialog(true)
  }

  const handleDeleteAddress = (id: string) => {
    deleteAddress(id)
    toast({
      title: "Thành công",
      description: "Đã xóa địa chỉ",
    })
  }

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id)
    toast({
      title: "Thành công",
      description: "Đã đặt làm địa chỉ mặc định",
    })
  }

  return (
    <div className="container py-8 md:py-12">
      <Suspense fallback={null}>
        <AccountPageContent setActiveTab={setActiveTab} />
      </Suspense>
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
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Mật Khẩu Bảo Mật</span>
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
            {loadingProfile ? (
              <div className="text-center py-12">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải thông tin...</p>
              </div>
            ) : profileError ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-red-500 text-center">{profileError}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Đơn hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {profile?.stats?.totalOrders ?? orders.length}
                      </div>
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
                      <div className="text-2xl font-bold">
                        {profile?.stats?.savedDesigns ?? user.savedDesigns.length}
                      </div>
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
                        {formatCurrency(
                          profile?.stats?.totalSpent ?? 
                          orders.reduce((sum, order) => sum + order.totalAmount, 0)
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">VNĐ</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Info */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-start gap-4 pb-6 border-b">
                      {profile?.avatar ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                          <Image
                            src={profile.avatar}
                            alt="Avatar"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary/20 flex-shrink-0">
                          {profile?.fullName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold mb-1">
                          {profile?.fullName || user?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {profile?.email || user?.email}
                        </p>
                        {profile?.emailVerified && (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            ✓ Đã xác thực
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                            Email
                          </p>
                          <p className="text-sm font-medium break-all">
                            {profile?.email || user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                            Số điện thoại
                          </p>
                          <p className="text-sm font-medium">
                            {profile?.phoneNumber || user?.phoneNumber || (
                              <span className="text-muted-foreground italic">Chưa cập nhật</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Account Status */}
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                            Trạng thái tài khoản
                          </p>
                          <div className="flex items-center gap-2">
                            {profile?.isActive ? (
                              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                Hoạt động
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Đã khóa</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {profile?.isActive ? "Tài khoản đang hoạt động" : "Tài khoản đã bị khóa"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Member Since */}
                      {profile?.createdAt && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                          <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                            <Home className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                              Thành viên từ
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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
                                  <Badge variant={getStatusVariant(getOrderStatus(order))}>
                                    {getStatusLabel(getOrderStatus(order))}
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

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Đổi mật khẩu
                  </CardTitle>
                  {!showPasswordForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Đổi mật khẩu
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showPasswordForm ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Mật khẩu phải có ít nhất 6 ký tự
                      </p>
                    </div>

                    {passwordError && (
                      <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={changingPassword}
                      >
                        {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordData({ currentPassword: "", newPassword: "" })
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Nhấn nút &quot;Đổi mật khẩu&quot; để thay đổi mật khẩu của bạn. 
                      Mật khẩu mạnh giúp bảo vệ tài khoản của bạn khỏi các mối đe dọa bảo mật.
                    </p>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm mb-2">Mẹo tạo mật khẩu mạnh:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Sử dụng ít nhất 6 ký tự</li>
                        <li>Kết hợp chữ hoa, chữ thường và số</li>
                        <li>Không sử dụng thông tin cá nhân dễ đoán</li>
                        <li>Không chia sẻ mật khẩu với người khác</li>
                      </ul>
                    </div>
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
                {addresses.length === 0 ? (
                  <Card className="border-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{profile?.fullName || user?.name || "Chưa cập nhật"}</p>
                            <Badge>Mặc định</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profile?.phoneNumber || user?.phoneNumber || "Chưa cập nhật"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Địa chỉ giao hàng sẽ được cập nhật trong quá trình thanh toán
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <Card key={address.id} className={address.isDefault ? "border-primary" : ""}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">{address.fullName}</p>
                                {address.isDefault ? (
                                  <Badge>Mặc định</Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleSetDefault(address.id)}
                                  >
                                    Đặt làm mặc định
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{address.phoneNumber}</p>
                              <p className="text-sm">
                                {address.addressLine}, {address.wardName || address.ward}, {address.cityName || address.city}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAddress(address)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Sửa
                              </Button>
                              {!address.isDefault && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteAddress(address.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                <Button variant="outline" onClick={() => setShowAddressDialog(true)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Thêm địa chỉ mới
                </Button>
              </CardContent>
            </Card>

            {/* Add/Edit Address Dialog */}
            <Dialog open={showAddressDialog} onOpenChange={(open) => {
              setShowAddressDialog(open)
              if (!open) {
                setEditingAddress(null)
                setAddressForm({
                  fullName: profile?.fullName || user?.name || "",
                  phoneNumber: profile?.phoneNumber || user?.phoneNumber || "",
                  addressLine: "",
                  ward: "",
                  city: "",
                })
                setWards([])
              }
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
                  <DialogDescription>
                    Điền thông tin địa chỉ giao hàng của bạn
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="address-fullName">Họ và tên</Label>
                    <Input
                      id="address-fullName"
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, fullName: e.target.value })
                      }
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-phone">Số điện thoại</Label>
                    <Input
                      id="address-phone"
                      value={addressForm.phoneNumber}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, phoneNumber: e.target.value })
                      }
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-line">Địa chỉ chi tiết</Label>
                    <Input
                      id="address-line"
                      value={addressForm.addressLine}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, addressLine: e.target.value })
                      }
                      placeholder="Số nhà, tên đường"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-city">Tỉnh/Thành phố</Label>
                      <Select
                        value={addressForm.city}
                        onValueChange={handleProvinceChange}
                        disabled={loadingProvinces}
                      >
                        <SelectTrigger id="address-city">
                          <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={String(province.code)} value={String(province.code)}>
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address-ward">Phường/Xã</Label>
                      <Select
                        value={addressForm.ward}
                        onValueChange={(value) =>
                          setAddressForm({ ...addressForm, ward: value })
                        }
                        disabled={!addressForm.city || loadingWards}
                      >
                        <SelectTrigger id="address-ward">
                          <SelectValue
                            placeholder={
                              !addressForm.city
                                ? "Chọn tỉnh/thành phố trước"
                                : loadingWards
                                ? "Đang tải..."
                                : "Chọn phường/xã"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.map((ward) => (
                            <SelectItem key={String(ward.code)} value={String(ward.code)}>
                              {ward.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddressDialog(false)
                      setEditingAddress(null)
                      setAddressForm({
                        fullName: profile?.fullName || user?.name || "",
                        phoneNumber: profile?.phoneNumber || user?.phoneNumber || "",
                        addressLine: "",
                        ward: "",
                        city: "",
                      })
                      setWards([])
                    }}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleAddAddress}>
                    {editingAddress ? "Lưu thay đổi" : "Thêm địa chỉ"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  {!editMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      {formData.avatar ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden">
                          <Image
                            src={formData.avatar}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold">
                          {formData.fullName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="settings-fullName">Họ và tên</Label>
                      <Input
                        id="settings-fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-email">Email</Label>
                      <Input
                        id="settings-email"
                        type="email"
                        value={profile?.email || user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email không thể thay đổi
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-phone">Số điện thoại</Label>
                      <Input
                        id="settings-phone"
                        value={formData.phoneNumber || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-avatar">Ảnh đại diện</Label>
                      
                      {/* Avatar Preview */}
                      {formData.avatar ? (
                        <div className="space-y-3">
                          <div className="relative inline-block">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
                              <Image
                                src={formData.avatar}
                                alt="Avatar preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                              onClick={handleRemoveAvatar}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Nhấn nút bên dưới để thay đổi ảnh
                          </p>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                          <User className="h-12 w-12 text-primary/50" />
                        </div>
                      )}

                      {/* Upload Button */}
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="w-full"
                        >
                          {uploadingAvatar ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang upload...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              {formData.avatar ? "Thay đổi ảnh" : "Upload ảnh đại diện"}
                            </>
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          Chọn ảnh từ máy tính. Tối đa 5MB (khuyến nghị &lt; 2MB). Định dạng: JPG, PNG, GIF
                        </p>
                      </div>
                    </div>

                    {updateError && (
                      <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                        {updateError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={updatingProfile}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditMode(false)
                          if (profile) {
                            setFormData({
                              fullName: profile.fullName || "",
                              phoneNumber: profile.phoneNumber || "",
                              avatar: profile.avatar || null,
                            })
                          }
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {profile?.avatar ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden">
                          <Image
                            src={profile.avatar}
                            alt="Avatar"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold">
                          {profile?.fullName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">
                          {profile?.fullName || user?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {profile?.email || user?.email}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Họ và tên</Label>
                        <p className="text-base">{profile?.fullName || user?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Email</Label>
                        <p className="text-base">{profile?.email || user?.email}</p>
                        {profile?.emailVerified && (
                          <Badge variant="default" className="mt-1">
                            Đã xác thực
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Số điện thoại</Label>
                        <p className="text-base">
                          {profile?.phoneNumber || user?.phoneNumber || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Trạng thái</Label>
                        <p className="text-base">
                          {profile?.isActive ? (
                            <Badge variant="default">Hoạt động</Badge>
                          ) : (
                            <Badge variant="destructive">Đã khóa</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

