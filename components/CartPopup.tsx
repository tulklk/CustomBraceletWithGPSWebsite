"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/store/useCart"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { productsApi, BackendProduct } from "@/lib/api/products"
import { Badge } from "@/components/ui/badge"

interface CartPopupProps {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

interface ProductInfo {
  [productId: string]: BackendProduct | null
}

export function CartPopup({ open, onClose, triggerRef }: CartPopupProps) {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart()
  const popupRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<ProductInfo>({})
  const [loading, setLoading] = useState(false)

  // Fetch product information for cart items
  useEffect(() => {
    if (!open || items.length === 0) {
      setProducts({})
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      const productIds = [...new Set(items.map(item => item.design.productId))]
      const productMap: ProductInfo = {}
      
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            // First, get all products to find the slug
            const allProducts = await productsApi.getAll()
            const product = allProducts.find(p => p.id === productId)
            
            if (product && product.slug) {
              // Fetch full product details by slug
              const fullProduct = await productsApi.getBySlug(product.slug)
              if (fullProduct) {
                productMap[productId] = fullProduct
              } else {
                console.warn(`Product not found by slug: ${product.slug}`)
                productMap[productId] = null
              }
            } else {
              console.warn(`Product not found in list: ${productId}`)
              productMap[productId] = null
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

  if (!open) return null

  // Empty cart state
  if (items.length === 0) {
    return (
      <div
        ref={popupRef}
        className={cn(
          "absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50",
          "transition-all duration-200 ease-out",
          open ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
        )}
        onMouseEnter={(e) => {
          e.stopPropagation()
        }}
        onMouseLeave={onClose}
      >
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Chưa có sản phẩm trong giỏ hàng.
          </p>
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90"
            onClick={onClose}
          >
            <Link href="/products">QUAY TRỞ LẠI CỬA HÀNG</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={popupRef}
      className={cn(
        "absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50",
        "transition-all duration-200 ease-out",
        open ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
      )}
      onMouseEnter={(e) => {
        e.stopPropagation()
      }}
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Giỏ hàng của bạn</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? "sản phẩm" : "sản phẩm"}
        </p>
      </div>

      {/* Cart Items */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {items.slice(0, 3).map((item) => {
              const product = products[item.design.productId]
              // Use product name from API, fallback to template or product ID
              const productName = product?.name || (item.design.templateId ? `Template: ${item.design.templateId}` : `Sản phẩm ${item.design.productId}`)
              // Prioritize product image from API
              const productImage = product?.imageUrls?.[0] || product?.images?.[0] || ""
              const stockQuantity = product?.stockQuantity ?? 0
              const isInStock = stockQuantity > 0
              // Use product price from API if available, otherwise use design unitPrice
              const currentPrice = product?.price || item.design.unitPrice || 0
              const originalPrice = product?.originalPrice || null
              const hasDiscount = originalPrice && originalPrice > currentPrice

              return (
                <div key={item.id} className="flex gap-3">
                  {/* Product Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {productImage ? (
                      <Image
                        src={productImage}
                        alt={productName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : item.design.previewDataURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.design.previewDataURL}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {productName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(item.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, item.qty - 1)
                          }}
                          disabled={item.qty <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, item.qty + 1)
                          }}
                          disabled={!isInStock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatCurrency(currentPrice * item.qty)}
                        </p>
                        {hasDiscount && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(originalPrice! * item.qty)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {items.length > 3 && (
          <p className="text-xs text-muted-foreground text-center pb-4">
            +{items.length - 3} sản phẩm khác
          </p>
        )}
      </div>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-3">
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Tổng cộng:</span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(getTotalPrice())}
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90"
            onClick={onClose}
          >
            <Link href="/checkout">Thanh toán</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

