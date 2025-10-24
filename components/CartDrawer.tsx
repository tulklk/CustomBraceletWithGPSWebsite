"use client"

import Link from "next/link"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
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

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart()

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
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border rounded-lg p-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          Template: {item.design.templateId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Màu: {item.design.colors.band} / {item.design.colors.face}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {item.design.accessories.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Phụ kiện: {item.design.accessories.length} charm(s)
                      </p>
                    )}

                    {item.design.engrave && (
                      <p className="text-sm text-muted-foreground">
                        Khắc: &quot;{item.design.engrave.text}&quot;
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.design.unitPrice * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter>
            <Separator className="mb-4" />
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Tổng cộng:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(getTotalPrice())}
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

