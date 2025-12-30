"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
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
  MapPin, Save, Heart, Settings, Phone, Mail, Home, Lock, ShieldCheck, Upload, Loader2, X,
  ChevronLeft, ChevronRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { ordersApi, Order, OrderStatus } from "@/lib/api/orders"
import { useUserProfile } from "@/hooks/useUserProfile"
import { useUpdateProfile } from "@/hooks/useUpdateProfile"
import { useChangePassword } from "@/hooks/useChangePassword"
import { UpdateProfileRequest, ChangePasswordRequest } from "@/types/user"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { OrderStatusTracker } from "@/components/OrderStatusTracker"
import { provincesApi, Province, Ward } from "@/lib/api/provinces"
import { useAddresses, Address } from "@/store/useAddresses"
import { productsApi } from "@/lib/api/products"
import { wishlistApi, WishlistItem } from "@/lib/api/wishlist"
import Image from "next/image"
import Link from "next/link"

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
function AccountPageContent({ 
  setActiveTab, 
  onOrderIdFound 
}: { 
  setActiveTab: (tab: string) => void
  onOrderIdFound: (orderId: string) => void
}) {
  const searchParams = useSearchParams()
  const processedOrderIdRef = useRef<string | null>(null) // Track processed orderId to prevent multiple calls
  
  // Check if we should open orders tab from URL
  useEffect(() => {
    const orderId = searchParams?.get("order")
    const tab = searchParams?.get("tab")
    const openOrder = searchParams?.get("openOrder")
    
    if (tab) {
      setActiveTab(tab)
    } else if (orderId) {
      setActiveTab("orders")
    }
    
    // Auto-open order detail if:
    // 1. openOrder=true is explicitly set (user clicked "Xem đơn hàng" button)
    // 2. OR not from payment flow (to avoid auto-opening when redirected from payment)
    // 3. AND we haven't processed this orderId yet
    if (orderId && orderId !== processedOrderIdRef.current) {
      const referrer = typeof window !== 'undefined' ? document.referrer : ''
      const isFromPayment = referrer.includes('/payment/') || 
                           (typeof window !== 'undefined' && window.location.pathname.includes('payment'))
      
      // If openOrder=true, always open regardless of referrer
      // Otherwise, only open if not from payment flow
      if (openOrder === 'true' || !isFromPayment) {
        // Mark this orderId as processed to prevent multiple calls
        processedOrderIdRef.current = orderId
        
        // Small delay to ensure orders are loaded first
        setTimeout(() => {
          onOrderIdFound(orderId)
        }, 300)
      }
    }
    
    // Reset processed orderId if orderId changes or is removed from URL
    if (!orderId) {
      processedOrderIdRef.current = null
    }
  }, [searchParams, setActiveTab, onOrderIdFound])
  
  return null
}

export default function AccountPage() {
  const { user, logout, removeDesign, makeAuthenticatedRequest, updateUser } = useUser()
  const { setTemplate, setColor, setEngrave } = useCustomizer()
  const { addItem, addItemByProductId } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false)
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false)
  const [productImages, setProductImages] = useState<Record<string, string>>({})
  const fetchingImagesRef = useRef(false) // Prevent multiple image fetch calls
  
  // Wishlist states
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loadingWishlist, setLoadingWishlist] = useState(false)
  const wishlistScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  
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

  // Sync user store with profile when profile changes
  // This ensures navbar and other components show updated info
  useEffect(() => {
    if (profile && user) {
      // Only update if there are actual differences to avoid unnecessary updates
      const hasChanges = 
        profile.fullName !== user.fullName ||
        profile.phoneNumber !== user.phoneNumber ||
        profile.avatar !== user.avatar ||
        profile.role !== user.role ||
        profile.emailVerified !== user.emailVerified

      if (hasChanges) {
        updateUser({
          fullName: profile.fullName,
          name: profile.fullName, // Also update name for backward compatibility
          phoneNumber: profile.phoneNumber,
          avatar: profile.avatar,
          role: profile.role,
          emailVerified: profile.emailVerified,
        })
      }
    }
  }, [profile, user, updateUser])

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
      setCurrentPage(1) // Reset to first page when fetching orders
    }
  }, [user?.accessToken, activeTab])

  // Fetch wishlist when user is logged in and wishlist tab is active
  useEffect(() => {
    if (user?.accessToken && activeTab === "wishlist") {
      fetchWishlist()
    }
  }, [user?.accessToken, activeTab])

  const fetchWishlist = async () => {
    if (!user?.accessToken) return

    setLoadingWishlist(true)
    try {
      const items = await makeAuthenticatedRequest(async (token) => {
        return await wishlistApi.getAll(token)
      })
      console.log("Wishlist items received:", items)
      console.log("Wishlist items count:", items?.length)
      
      // If items don't have product data, fetch product details
      const itemsWithProducts = await Promise.all(
        (items || []).map(async (item) => {
          if (item.product) {
            return item
          }
          
          // Fetch product details if missing
          try {
            console.log("Fetching product details for:", item.productId)
            const product = await productsApi.getById(item.productId)
            return {
              ...item,
              product: product,
            }
          } catch (error) {
            console.error("Error fetching product for wishlist item:", error)
            return null
          }
        })
      )
      
      // Filter out null items (failed to fetch product)
      const validItems = itemsWithProducts.filter((item): item is WishlistItem => item !== null)
      console.log("Valid wishlist items count:", validItems.length)
      setWishlistItems(validItems)
    } catch (error: any) {
      console.error("Error fetching wishlist:", error)
      toast({
        title: "Lỗi khi tải danh sách yêu thích",
        description: error.message || "Vui lòng thử lại sau",
        variant: "destructive",
      })
      setWishlistItems([])
    } finally {
      setLoadingWishlist(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.accessToken) return

    try {
      await makeAuthenticatedRequest(async (token) => {
        await wishlistApi.remove(token, productId)
      })
      setWishlistItems(wishlistItems.filter(item => item.productId !== productId))
      toast({
        title: "Đã xóa khỏi danh sách yêu thích",
      })
    } catch (error: any) {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa sản phẩm",
        variant: "destructive",
      })
    }
  }

  const handleAddToCartFromWishlist = async (productId: string) => {
    try {
      await addItemByProductId(productId, 1)
      toast({
        title: "Đã thêm vào giỏ hàng!",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      })
    }
  }

  // Scroll wishlist functions
  const scrollWishlist = (direction: 'left' | 'right') => {
    const container = wishlistScrollRef.current
    if (!container) return

    const scrollAmount = 400 // Scroll 400px each time
    const currentScroll = container.scrollLeft
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }

  // Check scroll position to show/hide arrows
  const checkWishlistScroll = () => {
    const container = wishlistScrollRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px threshold
  }

  // Check scroll on mount and when items change
  useEffect(() => {
    checkWishlistScroll()
    const container = wishlistScrollRef.current
    if (container) {
      container.addEventListener('scroll', checkWishlistScroll)
      window.addEventListener('resize', checkWishlistScroll)
      return () => {
        container.removeEventListener('scroll', checkWishlistScroll)
        window.removeEventListener('resize', checkWishlistScroll)
      }
    }
  }, [wishlistItems])

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

  // Track if we're already processing an order from URL to prevent multiple calls
  const processingOrderIdRef = useRef<string | null>(null)
  
  // Define handleViewOrderDetail first so it can be used in handleOrderIdFromUrl
  const handleViewOrderDetail = async (orderId: string) => {
    if (!user?.accessToken) return

    // Prevent multiple simultaneous calls
    if (loadingOrderDetail) return

    // Reset states and open dialog first for better UX
    setProductImages({}) // Reset product images
    setSelectedOrder(null) // Reset selected order
    fetchingImagesRef.current = false // Reset image fetching flag
    setLoadingOrderDetail(true)
    setOrderDetailDialogOpen(true)
    
    try {
      // First, fetch order detail (main data)
      const orderDetail = await makeAuthenticatedRequest(async (token) => {
        return await ordersApi.getOrderById(
          orderId,
          token,
          user.refreshToken,
          (newToken) => {
            // Token refresh handled by makeAuthenticatedRequest
          }
        )
      })
      
      // Validate orderDetail is not null
      if (!orderDetail) {
        throw new Error("Không tìm thấy thông tin đơn hàng")
      }
      
      // Set order detail first to show content immediately
      setSelectedOrder(orderDetail)
      setLoadingOrderDetail(false)

      // Fetch product images asynchronously in background (non-blocking)
      // This allows the dialog to show order info immediately while images load
      // Only fetch if not already fetching
      if (!fetchingImagesRef.current) {
        fetchingImagesRef.current = true
        
        const fetchImagesAsync = async () => {
          const imageMap: Record<string, string> = {}
          
          // First, check for images already in order items
          orderDetail.items.forEach((item) => {
            const itemWithImage = item as any
            if (itemWithImage.productImageUrl || itemWithImage.imageUrl) {
              imageMap[item.id] = itemWithImage.productImageUrl || itemWithImage.imageUrl
            }
          })
          
          // Update with existing images first
          if (Object.keys(imageMap).length > 0) {
            setProductImages({ ...imageMap })
          }
          
          // Then fetch missing images in batches
          const itemsNeedingFetch = orderDetail.items.filter((item) => {
            const itemWithImage = item as any
            return !itemWithImage.productImageUrl && !itemWithImage.imageUrl
          })
          
          if (itemsNeedingFetch.length > 0) {
            const batchSize = 3
            for (let i = 0; i < itemsNeedingFetch.length; i += batchSize) {
              const batch = itemsNeedingFetch.slice(i, i + batchSize)
              
              await Promise.all(
                batch.map(async (item) => {
                  try {
                    const product = await productsApi.getBySlug(item.productId)
                    if (product) {
                      const imageUrl = 
                        (product.images && product.images.length > 0 && product.images[0]) ||
                        (product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0]) ||
                        ""
                      if (imageUrl) {
                        imageMap[item.id] = imageUrl
                      }
                    }
                  } catch (productError) {
                    // If product fetch fails, silently continue
                    console.warn(`Could not fetch product ${item.productId}:`, productError)
                  }
                })
              )
              
              // Update images only once per batch to reduce re-renders
              setProductImages(prev => ({ ...prev, ...imageMap }))
            }
          }
          
          fetchingImagesRef.current = false
        }
        
        // Start fetching images in background (don't await)
        fetchImagesAsync().catch(error => {
          console.error("Error fetching product images:", error)
          fetchingImagesRef.current = false
          // Don't show error toast for image loading failures
        })
      }
      
    } catch (error: any) {
      console.error("Error fetching order detail:", error)
      fetchingImagesRef.current = false
      
      // Check if error is related to payment link creation
      const errorMessage = error.message || ""
      if (errorMessage.includes("payment") || errorMessage.includes("Payment") || errorMessage.includes("payment link")) {
        // This is a payment-related error, but we're just viewing order details
        // Don't show payment error, just show generic error
        toast({
          title: "Lỗi khi tải chi tiết đơn hàng",
          description: "Vui lòng thử lại sau",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Lỗi khi tải chi tiết đơn hàng",
          description: error.message || "Vui lòng thử lại sau",
          variant: "destructive",
        })
      }
      setOrderDetailDialogOpen(false)
      setSelectedOrder(null)
      setLoadingOrderDetail(false)
    }
  }

  // Handle order ID from URL - only auto-open if explicitly requested (not from payment flow)
  const handleOrderIdFromUrl = useCallback((orderId: string) => {
    if (user?.accessToken && orderId) {
      // Prevent multiple calls for the same orderId
      if (processingOrderIdRef.current === orderId) {
        return
      }
      
      // Check if this is from payment flow - if so, don't auto-open
      // Check referrer to see if we came from payment pages
      const referrer = typeof window !== 'undefined' ? document.referrer : ''
      const isFromPayment = referrer.includes('/payment/') || 
                           (typeof window !== 'undefined' && window.location.pathname.includes('payment'))
      
      if (!isFromPayment) {
        // Mark as processing
        processingOrderIdRef.current = orderId
        
        // Wait for orders to be loaded, then open order detail
        const tryOpenOrder = () => {
          // Check if orders are loaded (either we have orders or loading is complete)
          if (orders.length > 0 || !loadingOrders) {
            handleViewOrderDetail(orderId)
            // Reset after a delay to allow re-opening if needed
            setTimeout(() => {
              processingOrderIdRef.current = null
            }, 1000)
          } else {
            // If orders are still loading, wait a bit more
            setTimeout(tryOpenOrder, 200)
          }
        }
        
        // Start trying after a short delay
        setTimeout(tryOpenOrder, 300)
      }
    }
  }, [user?.accessToken, orders.length, loadingOrders])

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
      
      // Update user store immediately with formData to reflect changes in navbar
      // This ensures navbar and other components show updated info right away
      updateUser({
        fullName: formData.fullName || user?.fullName || "",
        name: formData.fullName || user?.name || "", // Also update name for backward compatibility
        phoneNumber: formData.phoneNumber || user?.phoneNumber || null,
        avatar: formData.avatar || user?.avatar || null,
      })
      
      // Refetch profile to sync with backend
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
        <AccountPageContent setActiveTab={setActiveTab} onOrderIdFound={handleOrderIdFromUrl} />
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Đơn hàng</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Yêu thích</span>
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
            <div className="grid md:grid-cols-2 gap-6">
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
                              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              }) : "N/A"}
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
                  <>
                    <div className="space-y-4">
                      {orders
                        .filter(order => order.createdAt)
                        .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                        .map((order) => {
                        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "N/A"
                        return (
                          <Card key={order.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold">
                                      #{order.orderNumber || order.id}
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
                                    onClick={() => handleViewOrderDetail(order.id)}
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
                    
                    {/* Pagination */}
                    {(() => {
                      const filteredOrders = orders.filter(order => order.createdAt)
                      const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
                      
                      if (totalPages <= 1) return null
                      
                      return (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Hiển thị {(currentPage - 1) * ordersPerPage + 1} - {Math.min(currentPage * ordersPerPage, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Trước
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Show first page, last page, current page, and pages around current
                                if (
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                  return (
                                    <Button
                                      key={page}
                                      variant={currentPage === page ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentPage(page)}
                                      className="w-10"
                                    >
                                      {page}
                                    </Button>
                                  )
                                } else if (
                                  page === currentPage - 2 ||
                                  page === currentPage + 2
                                ) {
                                  return (
                                    <span key={page} className="px-2 text-muted-foreground">
                                      ...
                                    </span>
                                  )
                                }
                                return null
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Sau
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )
                    })()}
                  </>
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

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Sản phẩm yêu thích
              </h2>
              <p className="text-muted-foreground mb-6">
                Danh sách các sản phẩm bạn đã đánh dấu yêu thích.
              </p>
            </div>

            {loadingWishlist ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang tải danh sách yêu thích...</p>
                </div>
              </div>
            ) : wishlistItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm yêu thích</h3>
                  <p className="text-muted-foreground mb-6">
                    Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
                  </p>
                  <Button asChild>
                    <Link href="/products">Xem sản phẩm</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Tìm thấy {wishlistItems.length} sản phẩm yêu thích
                </div>
                <div className="relative">
                  {/* Left Arrow */}
                  {canScrollLeft && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
                      onClick={() => scrollWishlist('left')}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  
                  {/* Right Arrow */}
                  {canScrollRight && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
                      onClick={() => scrollWishlist('right')}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  )}

                  {/* Scrollable Container */}
                  <div
                    ref={wishlistScrollRef}
                    className="flex gap-6 overflow-x-auto pb-4 px-2 scroll-smooth scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                    onScroll={checkWishlistScroll}
                  >
                    {wishlistItems
                      .filter((item) => item.product) // Filter out items without product
                      .map((item) => {
                  const product = item.product!
                  const images = product.imageUrls && product.imageUrls.length > 0 
                    ? product.imageUrls 
                    : product.images && product.images.length > 0 
                    ? product.images 
                    : []
                  const discount = product.originalPrice && product.originalPrice > product.price
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0

                  return (
                    <Card key={item.productId} className="overflow-hidden flex-shrink-0 w-80">
                      <div className="relative">
                        <Link href={`/products/${product.slug}`}>
                          <div className="relative aspect-square bg-muted">
                            {images.length > 0 ? (
                              <Image
                                src={images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-16 w-16 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </Link>
                        {discount > 0 && (
                          <Badge className="absolute top-2 right-2 bg-red-500">
                            -{discount}%
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                          onClick={() => handleRemoveFromWishlist(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAddToCartFromWishlist(item.productId)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Thêm vào giỏ
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveFromWishlist(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                  </div>
                </div>
              </div>
            )}
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

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailDialogOpen} onOpenChange={setOrderDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              #{selectedOrder?.orderNumber || selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {loadingOrderDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
              </div>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Mã đơn hàng</Label>
                  <p className="font-semibold">#{selectedOrder.orderNumber || selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Ngày đặt</Label>
                  <p className="text-sm">
                    {selectedOrder.createdAt ? (
                      <span className="font-semibold">
                        {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phương thức thanh toán</Label>
                  <p className="text-sm">
                    {selectedOrder.paymentMethod === 0 ? (
                      <span className="font-semibold">COD</span>
                    ) : selectedOrder.paymentMethod === 1 ? (
                      <span className="font-semibold">Chuyển khoản qua Ngân Hàng</span>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Địa chỉ giao hàng</Label>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                      <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress.phoneNumber}</p>
                      <p className="text-sm">
                        {selectedOrder.shippingAddress.addressLine}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.city}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Order Items */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Sản phẩm</Label>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => {
                    const itemImageUrl = productImages[item.id] || (item as any).productImageUrl || (item as any).imageUrl
                    return (
                      <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                        {/* Product Image */}
                        {itemImageUrl ? (
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={itemImageUrl}
                              alt={item.productNameSnapshot || "Sản phẩm"}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.productNameSnapshot || "Sản phẩm"}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Số lượng: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold">{formatCurrency(item.lineTotal)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-2">
                {selectedOrder.subtotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                )}
                {selectedOrder.voucherCode && selectedOrder.discountAmount && (
                  <>
                    <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mã giảm giá ({selectedOrder.voucherCode}):</span>
                    <span className="text-green-600">-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold mt-4">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Order Status Tracker */}
              {selectedOrder.orderStatus !== undefined && selectedOrder.orderStatus !== null && (
                <OrderStatusTracker orderStatus={selectedOrder.orderStatus} />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy thông tin đơn hàng</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

