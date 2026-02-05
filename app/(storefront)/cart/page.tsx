"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/store/useCart"
import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, X, ShoppingBag, ArrowRight, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { productsApi, BackendProduct } from "@/lib/api/products"

interface ProductInfo {
  [productId: string]: BackendProduct | null
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart()
  const [products, setProducts] = useState<ProductInfo>({})
  const [loading, setLoading] = useState(true)

  // Fetch product information for all cart items
  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = [...new Set(items.map(item => item.design.productId))]
      const productMap: ProductInfo = {}

      await Promise.all(
        productIds.map(async (productId) => {
          try {
            // Try to get product by ID from all products
            const allProducts = await productsApi.getAll()
            const product = allProducts.find(p => p.id === productId)
            if (product) {
              // Fetch full product details by slug
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

    if (items.length > 0) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [items])

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
          <h1 className="text-3xl font-bold">Giỏ hàng trống</h1>
          <p className="text-muted-foreground">
            Bạn chưa có sản phẩm nào trong giỏ hàng
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
      <h1 className="text-4xl font-bold mb-8">Giỏ hàng của bạn</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const product = products[item.design.productId]
              const productName = product?.name || `Sản phẩm ${item.design.productId}`
              const imageData = product?.imageUrls?.[0] || product?.images?.[0] || ""
              const productImage = typeof imageData === 'string' ? imageData : imageData?.imageUrl || ""
              const stockQuantity = product?.stockQuantity ?? 0
              const isInStock = stockQuantity > 0
              const currentPrice = item.design.unitPrice || product?.price || 0
              const originalPrice = product?.originalPrice || null
              const hasDiscount = originalPrice && originalPrice > currentPrice
              const discountPercent = hasDiscount
                ? Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100)
                : 0

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={productName}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {productName}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Tình trạng:{" "}
                              <span className={isInStock ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {isInStock ? "Còn hàng" : "Hết hàng"}
                              </span>
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                            aria-label="Xóa sản phẩm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Custom Design Info (if applicable) */}
                        {item.design.templateId && (
                          <p className="text-sm text-muted-foreground">
                            Template: {item.design.templateId}
                          </p>
                        )}

                        {item.design.colors && (item.design.colors.band !== '#FFFFFF' || item.design.colors.face !== '#FFFFFF') && (
                          <p className="text-sm text-muted-foreground">
                            Màu: {item.design.colors.band} / {item.design.colors.face}
                          </p>
                        )}

                        {/* Engraving Text (if applicable) */}
                        {item.design.engrave?.text && (
                          <p className="text-sm text-muted-foreground">
                            Nội dung khắc tên: <span className="font-medium text-foreground">{item.design.engrave.text}</span>
                          </p>
                        )}

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.qty - 1)}
                              disabled={item.qty <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium border rounded-md py-1">
                              {item.qty}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.qty + 1)}
                              disabled={!isInStock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              {hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(originalPrice! * item.qty)}
                                </span>
                              )}
                              <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(currentPrice * item.qty)}
                              </span>
                            </div>
                            {hasDiscount && (
                              <Badge variant="destructive" className="text-xs">
                                -{discountPercent}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>
                    {formatCurrency(
                      items.reduce((total, item) => {
                        const product = products[item.design.productId]
                        const currentPrice = product?.price || item.design.unitPrice || 0
                        return total + (currentPrice * item.qty)
                      }, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    items.reduce((total, item) => {
                      const product = products[item.design.productId]
                      const currentPrice = product?.price || item.design.unitPrice || 0
                      return total + (currentPrice * item.qty)
                    }, 0)
                  )}
                </span>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">
                  Thanh toán
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/products">Tiếp tục mua sắm</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

