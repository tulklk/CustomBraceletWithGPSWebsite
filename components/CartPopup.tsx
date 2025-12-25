"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/store/useCart"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface CartPopupProps {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export function CartPopup({ open, onClose, triggerRef }: CartPopupProps) {
  const { items, updateQuantity, getTotalPrice } = useCart()
  const popupRef = useRef<HTMLDivElement>(null)

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
        "absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50",
        "transition-all duration-200 ease-out",
        open ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
      )}
      onMouseEnter={(e) => {
        e.stopPropagation()
      }}
      onMouseLeave={onClose}
    >
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex gap-3">
              {/* Product Image */}
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                {item.design.previewDataURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.design.previewDataURL}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">
                  Template: {item.design.templateId}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(item.design.unitPrice)}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateQuantity(item.id, item.qty - 1)
                    }}
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
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 3 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            +{items.length - 3} sản phẩm khác
          </p>
        )}
      </div>

      <Separator />

      <div className="p-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tổng số phụ:</span>
          <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            <Link href="/cart">XEM GIỎ HÀNG</Link>
          </Button>
          <Button
            asChild
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={onClose}
          >
            <Link href="/checkout">THANH TOÁN</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

