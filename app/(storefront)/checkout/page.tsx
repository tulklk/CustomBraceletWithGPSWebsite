"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCart } from "@/store/useCart"
import { useUser } from "@/store/useUser"
import { useAddresses } from "@/store/useAddresses"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Wallet, Building, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { productsApi, BackendProduct } from "@/lib/api/products"
import { ordersApi, ShippingAddress, ApplyVoucherResponse } from "@/lib/api/orders"
import { provincesApi, Province, District, Ward } from "@/lib/api/provinces"
import { cartApi } from "@/lib/api/cart"

const checkoutSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  addressLine: z.string().min(5, "Địa chỉ quá ngắn"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  city: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  paymentMethod: z.enum(["COD", "PayOS"]), // Chỉ chấp nhận COD hoặc PayOS
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface ProductInfo {
  [productId: string]: BackendProduct | null
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user, makeAuthenticatedRequest } = useUser()
  const { getDefaultAddress } = useAddresses()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<ProductInfo>({})
  const [loading, setLoading] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  
  // Provinces, Wards state (removed districts)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  // Fetch product information for cart items
  useEffect(() => {
    if (items.length === 0) return

    const fetchProducts = async () => {
      setLoading(true)
      const productIds = [...new Set(items.map(item => item.design.productId))]
      const productMap: ProductInfo = {}
      
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const allProducts = await productsApi.getAll()
            const product = allProducts.find(p => p.id === productId)
            if (product && product.slug) {
              const fullProduct = await productsApi.getBySlug(product.slug)
              if (fullProduct) {
                productMap[productId] = fullProduct
              }
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error)
            productMap[productId] = null
          }
        })
      )
      
      setProducts(productMap)
      setLoading(false)
    }

    fetchProducts()
  }, [items])

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const fetchedProvinces = await provincesApi.getProvinces()
        console.log("Fetched provinces:", fetchedProvinces.length, fetchedProvinces)
        setProvinces(fetchedProvinces)
        if (fetchedProvinces.length === 0) {
          toast({
            title: "Không tìm thấy tỉnh/thành phố",
            description: "Vui lòng thử lại sau",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching provinces:", error)
        toast({
          title: "Lỗi khi tải danh sách tỉnh/thành phố",
          description: error instanceof Error ? error.message : "Vui lòng thử lại sau",
          variant: "destructive",
        })
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [toast])

  // Handle province change - load wards directly
  const handleProvinceChange = async (provinceCode: string) => {
    console.log("Province selected:", provinceCode)
    form.setValue("city", provinceCode)
    form.setValue("ward", "") // Reset ward
    setWards([])

    if (!provinceCode) return

    setLoadingWards(true)
    try {
      // Get wards directly from province
      const fetchedWards = await provincesApi.getWardsByProvince(provinceCode)
      console.log("Fetched wards:", fetchedWards.length)
      setWards(fetchedWards)
      
      if (fetchedWards.length === 0) {
        toast({
          title: "Không tìm thấy phường/xã",
          description: "Tỉnh/thành phố này có thể chưa có dữ liệu phường/xã",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching wards:", error)
      toast({
        title: "Lỗi khi tải danh sách phường/xã",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setLoadingWards(false)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Vui lòng nhập mã giảm giá",
        variant: "destructive",
      })
      return
    }

    setIsApplyingVoucher(true)
    try {
      let result: ApplyVoucherResponse
      
      // Try to apply voucher with auth if user is logged in, otherwise without auth
      if (user?.accessToken) {
        result = await makeAuthenticatedRequest(async (token: string) => {
          return await ordersApi.applyVoucher(
            { voucherCode: discountCode.trim() },
            token,
            user.refreshToken,
            (newToken: string) => {
              // Token refresh handled by makeAuthenticatedRequest
            }
          )
        })
      } else {
        // Apply voucher without authentication
        result = await ordersApi.applyVoucherWithoutAuth({ voucherCode: discountCode.trim() })
      }

      if (result.isValid && result.discountAmount) {
        setDiscountAmount(result.discountAmount)
        setDiscountApplied(true)
        toast({
          title: "Áp dụng mã giảm giá thành công!",
          description: `Giảm ${formatCurrency(result.discountAmount)}`,
        })
      } else {
        setDiscountApplied(false)
        setDiscountAmount(0)
        toast({
          title: "Mã giảm giá không hợp lệ",
          description: result.message || "Vui lòng kiểm tra lại mã giảm giá",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setDiscountApplied(false)
      setDiscountAmount(0)
      toast({
        title: "Lỗi khi áp dụng mã giảm giá",
        description: error.message || "Vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const shippingFee = 30000 // Phí vận chuyển: 30.000 VNĐ
  const finalTotal = getTotalPrice() - discountAmount + shippingFee

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: user?.fullName || user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      addressLine: "",
      ward: "",
      city: "",
      paymentMethod: "COD",
    },
  })

  // Update form values when user logs in or default address changes
  useEffect(() => {
    const defaultAddress = getDefaultAddress()
    const currentValues = form.getValues()
    
    if (user) {
      // Always update email from user account if user is logged in
      // Fill address from default address if available, otherwise from user profile
      const newCity = defaultAddress?.city || currentValues.city || ""
      const newWard = defaultAddress?.ward || currentValues.ward || ""
      
      form.reset({
        email: user.email || currentValues.email || "",
        fullName: defaultAddress?.fullName || currentValues.fullName || user.fullName || user.name || "",
        phoneNumber: defaultAddress?.phoneNumber || currentValues.phoneNumber || user.phoneNumber || "",
        addressLine: defaultAddress?.addressLine || currentValues.addressLine || "",
        ward: newWard,
        city: newCity,
        paymentMethod: currentValues.paymentMethod || "COD",
      })

      // If default address exists and city is set, load wards for the selected city
      if (defaultAddress?.city && newCity) {
        const loadWardsForCity = async () => {
          setLoadingWards(true)
          try {
            const fetchedWards = await provincesApi.getWardsByProvince(newCity)
            setWards(fetchedWards)
          } catch (error) {
            console.error("Error fetching wards:", error)
          } finally {
            setLoadingWards(false)
          }
        }
        loadWardsForCity()
      }
    } else {
      // If user logs out, keep form values but clear email if it was from account
      if (currentValues.email && !currentValues.email.includes("@")) {
        // If email looks like it was auto-filled, clear it
        form.setValue("email", "")
      }
    }
  }, [user, form, getDefaultAddress]) // Run when user, form, or default address changes

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)

    try {
      // Ensure email is set (from user account or form input)
      const email = data.email || user?.email || ""
      if (!email) {
        toast({
          title: "Email là bắt buộc",
          description: "Vui lòng nhập email để đặt hàng",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Get province and ward names from codes
      const selectedProvince = provinces.find(p => p.code === data.city || p.code?.toString() === data.city)
      const selectedWard = wards.find(w => w.code === data.ward || w.code?.toString() === data.ward)

      // Prepare shipping address (district is required by backend, use ward name as district since we removed district selection)
      const shippingAddress: ShippingAddress = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        addressLine: data.addressLine,
        ward: selectedWard?.name || data.ward,
        district: selectedWard?.name || data.ward || "N/A", // Backend requires this field, use ward name as fallback
        city: selectedProvince?.name || data.city,
      }

      // Map cart items to order items (only for guest checkout)
      const orderItems = items.map(item => ({
        productId: item.design.productId,
        quantity: item.qty,
      }))

      // Create order using API (with or without auth)
      let order: any
      
      if (user?.accessToken) {
        // User is logged in, sync cart to backend first, then create order
        try {
          // First, sync cart items to backend
          await makeAuthenticatedRequest(async (token: string) => {
            // Clear backend cart first to ensure it matches local cart
            try {
              await cartApi.clearCart(token, user.refreshToken, (newToken: string) => {
                // Token refresh handled by makeAuthenticatedRequest
              })
            } catch (error: any) {
              // Cart might not exist yet, that's okay
              console.log("Cart not found or already empty, will add items:", error)
            }

            // Add all local cart items to backend cart
            for (const item of items) {
              await cartApi.addItem(
                {
                  productId: item.design.productId,
                  quantity: item.qty,
                },
                token,
                user.refreshToken,
                (newToken: string) => {
                  // Token refresh handled by makeAuthenticatedRequest
                }
              )
            }
          })

          // Now create order (cart should exist on backend now)
          order = await makeAuthenticatedRequest(async (token: string) => {
            return await ordersApi.createOrder(
              {
                shippingAddress,
                paymentMethod: data.paymentMethod, // "COD" or "PayOS"
                voucherCode: discountApplied ? discountCode : undefined,
              },
              token,
              user.refreshToken,
              (newToken: string) => {
                // Token refresh handled by makeAuthenticatedRequest
              }
            )
          })
        } catch (error: any) {
          console.error("Error syncing cart or creating order:", error)
          toast({
            title: "Có lỗi xảy ra",
            description: error.message || "Không thể tạo đơn hàng. Vui lòng thử lại.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      } else {
        // User is not logged in, create order without authentication (guest checkout)
        order = await ordersApi.createOrderWithoutAuth({
          email: email,
          fullName: data.fullName,
          shippingAddress,
          paymentMethod: data.paymentMethod, // "COD" or "PayOS"
          items: orderItems,
          voucherCode: discountApplied ? discountCode : undefined,
        })
      }

      clearCart()

      // Handle payment flow based on payment method
      if (data.paymentMethod === "COD") {
        // COD: Redirect to success page
        toast({
          title: "Đặt hàng thành công!",
          description: `Mã đơn hàng: ${order.orderNumber || order.id}. Chúng tôi sẽ liên hệ qua ${data.phoneNumber}`,
        })
        
        // Redirect to success page
        if (user?.accessToken) {
          router.push(`/order/success?orderId=${order.id}`)
        } else {
          router.push(`/order/success?orderId=${order.id}`)
        }
      } else if (data.paymentMethod === "PayOS") {
        // PayOS: Create payment link and redirect to PayOS
        try {
          const baseUrl = window.location.origin
          const returnUrl = `${baseUrl}/payment/success?orderId=${order.id}`
          const cancelUrl = `${baseUrl}/payment/cancel?orderId=${order.id}`

          let paymentResult: any
          
          if (user?.accessToken) {
            paymentResult = await makeAuthenticatedRequest(async (token: string) => {
              return await ordersApi.createPaymentLink(
                order.id,
                {
                  provider: "PayOS",
                  returnUrl: returnUrl,
                  cancelUrl: cancelUrl,
                },
                token,
                user.refreshToken
              )
            })
          } else {
            paymentResult = await ordersApi.createPaymentLinkWithoutAuth(
              order.id,
              {
                provider: "PayOS",
                returnUrl: returnUrl,
                cancelUrl: cancelUrl,
              }
            )
          }
          
          if (paymentResult.paymentUrl) {
            // Redirect to PayOS checkout page
            window.location.href = paymentResult.paymentUrl
            return
          } else {
            throw new Error("Không nhận được payment URL từ PayOS")
          }
        } catch (paymentError: any) {
          console.error("Payment processing error:", paymentError)
          toast({
            title: "Lỗi khi tạo payment link",
            description: paymentError.message || "Vui lòng thử lại sau",
            variant: "destructive",
          })
          // Still redirect to order page even if payment link creation fails
          if (user?.accessToken) {
            router.push(`/account?order=${order.id}`)
          } else {
            router.push(`/?order=${order.id}`)
          }
        }
      }
    } catch (error: any) {
      console.error("Order creation error:", error)
      toast({
        title: "Có lỗi xảy ra",
        description: error.message || "Vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Giỏ hàng trống</h1>
          <p className="text-muted-foreground">
            Không có sản phẩm để thanh toán
          </p>
          <Button asChild size="lg">
            <Link href="/products">Khám phá sản phẩm</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Thanh toán</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="user@example.com"
                    disabled={!!user?.accessToken}
                    className={user?.accessToken ? "bg-muted cursor-not-allowed" : ""}
                  />
                  {user?.accessToken && (
                    <p className="text-xs text-muted-foreground">
                      Email được lấy từ tài khoản của bạn
                    </p>
                  )}
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder="Nguyễn Văn A"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register("phoneNumber")}
                    placeholder="0901234567"
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine">Địa chỉ (Số nhà, tên đường) *</Label>
                  <Input
                    id="addressLine"
                    {...form.register("addressLine")}
                    placeholder="123 Đường ABC"
                  />
                  {form.formState.errors.addressLine && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.addressLine.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                  <Select
                    value={form.watch("city") || undefined}
                    onValueChange={handleProvinceChange}
                    disabled={loadingProvinces}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.length === 0 && !loadingProvinces ? (
                        <SelectItem value="no-data" disabled>
                          Không có dữ liệu
                        </SelectItem>
                      ) : (
                        provinces.map((province) => (
                          <SelectItem key={province.code} value={String(province.code)}>
                            {province.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ward">Phường/Xã *</Label>
                  <Select
                    value={form.watch("ward") || undefined}
                    onValueChange={(value) => form.setValue("ward", value)}
                    disabled={!form.watch("city") || loadingWards}
                  >
                    <SelectTrigger id="ward">
                      <SelectValue 
                        placeholder={
                          !form.watch("city") 
                            ? "Vui lòng chọn tỉnh/thành phố trước" 
                            : loadingWards 
                            ? "Đang tải..." 
                            : "Chọn phường/xã"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.length === 0 && !loadingWards && form.watch("city") ? (
                        <SelectItem value="no-data" disabled>
                          Không có dữ liệu
                        </SelectItem>
                      ) : (
                        wards.map((ward) => (
                          <SelectItem key={ward.code} value={String(ward.code)}>
                            {ward.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.ward && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.ward.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    form.watch("paymentMethod") === "COD"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => form.setValue("paymentMethod", "COD")}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">COD</p>
                      <p className="text-sm text-muted-foreground">
                        Thanh toán bằng tiền mặt khi nhận được hàng
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    form.watch("paymentMethod") === "PayOS"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => form.setValue("paymentMethod", "PayOS")}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Chuyển Khoản Ngân Hàng</p>
                      <p className="text-sm text-muted-foreground">
                        Thanh toán online qua chuyển khoản
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              {/* Header with icon */}
              <CardHeader className="bg-primary/10 dark:bg-primary/20 pb-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-black dark:text-white">
                    Tóm tắt đơn hàng
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Product List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    items.map((item) => {
                      const product = products[item.design.productId]
                      const productName = product?.name || (item.design.templateId ? `Template: ${item.design.templateId}` : `Sản phẩm ${item.design.productId}`)
                      const productImage = product?.imageUrls?.[0] || product?.images?.[0] || ""
                      const currentPrice = product?.price || item.design.unitPrice || 0
                      
                      return (
                        <div key={item.id} className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                            {productImage ? (
                              <Image
                                src={productImage}
                                alt={productName}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {productName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Số lượng: {item.qty}
                            </p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              {formatCurrency(currentPrice * item.qty)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <Separator />

                {/* Discount Code Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mã giảm giá</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá (ví dụ: HELLO)"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1"
                      disabled={discountApplied}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyDiscount}
                      disabled={discountApplied || !discountCode.trim() || isApplyingVoucher}
                    >
                      {isApplyingVoucher ? "Đang xử lý..." : "Áp dụng"}
                    </Button>
                  </div>
                  {discountApplied && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Đã áp dụng mã giảm giá: {discountCode}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tạm tính ({items.length} {items.length === 1 ? "sản phẩm" : "sản phẩm"}):
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Giảm giá:
                      </span>
                      <span className="text-primary">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Phí vận chuyển:
                    </span>
                    <span className="text-primary font-medium">
                      {formatCurrency(shippingFee)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

