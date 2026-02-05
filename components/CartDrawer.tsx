"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useCart } from "@/store/useCart"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { productsApi, BackendProduct } from "@/lib/api/products"
import { Badge } from "@/components/ui/badge"

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ProductInfo {
  [productId: string]: BackendProduct | null
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart()
  const [products, setProducts] = useState<ProductInfo>({})
  const [loading, setLoading] = useState(false)

  // Fetch product information for cart items
  useEffect(() => {
    if (!open || items.length === 0) {
      setProducts({})
      setLoading(false)
      return
    }

    // Clear products immediately when drawer opens
    setProducts({})
    setLoading(true)

    const fetchProducts = async () => {
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
  }, [open, items])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Giỏ hàng của bạn</DrawerTitle>
          <DrawerDescription>
            {items.length === 0 ? "Chưa có sản phẩm nào" : `${items.length} sản phẩm`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4 max-h-[60vh]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Giỏ hàng trống</p>
              <Button asChild onClick={() => onOpenChange(false)}>
                <Link href="/products">Khám phá sản phẩm</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                items.map((item) => {
                  const product = products[item.design.productId]
                  const productName = product?.name || (item.design.templateId ? `Template: ${item.design.templateId}` : `Sản phẩm ${item.design.productId}`)
                  const productImage = productsApi.extractImageUrl(product?.imageUrls?.[0] || product?.images?.[0])
                  const stockQuantity = product?.stockQuantity ?? 0
                  const isInStock = stockQuantity > 0
                  // Use same logic as cart page: prioritize product.price, fallback to unitPrice
                  const currentPrice = product?.price || item.design.unitPrice || 0
                  const originalPrice = product?.originalPrice ?? null
                  const hasDiscount = originalPrice && originalPrice > currentPrice
                  const discountPercent = hasDiscount
                    ? Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100)
                    : 0

                  return (
                    <div key={item.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                          {productImage ? (
                            <Image
                              src={productImage}
                              alt={productName}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {productName}
                              </p>
                              <p className="text-sm mt-1">
                                Tình trạng:{" "}
                                <span className={isInStock ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                  {isInStock ? "Còn hàng" : "Hết hàng"}
                                </span>
                              </p>
                              {/* Engraving Text (if applicable) */}
                              {item.design.engrave?.text && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Nội dung khắc tên: <span className="font-medium text-foreground">{item.design.engrave.text}</span>
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
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

                          {/* Price */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">
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
                  )
                })
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter>
            <Separator className="mb-4" />
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Tổng cộng:</span>
              <span className="text-2xl font-bold text-primary">
                {loading || Object.keys(products).length === 0 ? (
                  <span className="text-muted-foreground">Đang tải...</span>
                ) : (
                  formatCurrency(
                    items.reduce((total, item) => {
                      const product = products[item.design.productId]
                      // Use same logic as cart page: prioritize product.price, fallback to unitPrice
                      // But only calculate when products have been fetched
                      const currentPrice = product?.price || item.design.unitPrice || 0
                      return total + (currentPrice * item.qty)
                    }, 0)
                  )
                )}
              </span>
            </div>
            <Button asChild size="lg" onClick={() => onOpenChange(false)}>
              <Link href="/checkout">Thanh toán</Link>
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Đóng</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}

