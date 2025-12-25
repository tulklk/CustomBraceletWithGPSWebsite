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
import { useCart } from "@/store/useCart"
import { useUser } from "@/store/useUser"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Wallet, Building, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { productsApi, BackendProduct } from "@/lib/api/products"

const checkoutSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().min(10, "Địa chỉ quá ngắn"),
  city: z.string().min(2, "Vui lòng nhập tỉnh/thành phố"),
  paymentMethod: z.enum(["cod", "momo", "bank"]),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface ProductInfo {
  [productId: string]: BackendProduct | null
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<ProductInfo>({})
  const [loading, setLoading] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

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

  const handleApplyDiscount = () => {
    // TODO: Implement discount code validation with API
    if (discountCode.trim()) {
      // Mock discount - 10% off
      const discount = getTotalPrice() * 0.1
      setDiscountAmount(discount)
      setDiscountApplied(true)
      toast({
        title: "Áp dụng mã giảm giá thành công!",
        description: `Giảm ${formatCurrency(discount)}`,
      })
    }
  }

  const finalTotal = getTotalPrice() - discountAmount

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.fullName || user?.name || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      address: "",
      city: "",
      paymentMethod: "cod",
    },
  })

  // Update form values when user logs in (only if fields are empty)
  useEffect(() => {
    if (user) {
      const currentValues = form.getValues()
      // Only auto-fill if fields are empty
      if (!currentValues.name || !currentValues.email || !currentValues.phone) {
        form.reset({
          name: currentValues.name || user.fullName || user.name || "",
          email: currentValues.email || user.email || "",
          phone: currentValues.phone || user.phoneNumber || "",
          address: currentValues.address || "",
          city: currentValues.city || "",
          paymentMethod: currentValues.paymentMethod || "cod",
        })
      }
    }
  }, [user?.id]) // Only run when user ID changes (user logs in)

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)

    try {
      // Mock API call
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total: finalTotal,
          discountCode: discountApplied ? discountCode : null,
          discountAmount: discountApplied ? discountAmount : 0,
          customer: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: `${data.address}, ${data.city}`,
          },
        }),
      })

      const order = await response.json()

      toast({
        title: "Đặt hàng thành công!",
        description: `Mã đơn hàng: ${order.id}. Chúng tôi sẽ liên hệ qua ${data.email}`,
      })

      clearCart()
      router.push("/")
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau",
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Nguyễn Văn A"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="0901234567"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="email@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ *</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="Số nhà, tên đường, phường/xã"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Hà Nội, TP.HCM, ..."
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.city.message}
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
                    form.watch("paymentMethod") === "cod"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => form.setValue("paymentMethod", "cod")}
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
                    form.watch("paymentMethod") === "momo"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => form.setValue("paymentMethod", "momo")}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Ví MoMo</p>
                      <p className="text-sm text-muted-foreground">
                        Thanh toán qua ví điện tử
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    form.watch("paymentMethod") === "bank"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => form.setValue("paymentMethod", "bank")}
                >
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-muted-foreground">
                        Nhận thông tin sau khi đặt hàng
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
                      disabled={discountApplied || !discountCode.trim()}
                    >
                      Áp dụng
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
                      Miễn phí
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

