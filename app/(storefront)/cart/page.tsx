"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/store/useCart"
import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart()

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
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-4xl">📍</div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Template: {item.design.templateId}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Màu: {item.design.colors.band} / {item.design.colors.face} /{" "}
                          {item.design.colors.rim}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        aria-label="Xóa sản phẩm"
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
                        Khắc: &quot;{item.design.engrave.text}&quot; ({item.design.engrave.font} -{" "}
                        {item.design.engrave.position === "inside"
                          ? "Mặt trong"
                          : "Dây đeo"}
                        )
                      </p>
                    )}

                    <div className="flex items-center justify-between">
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
                        <span className="w-12 text-center font-medium">
                          {item.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.design.unitPrice)} x {item.qty}
                        </p>
                        <p className="font-bold text-lg text-primary">
                          {formatCurrency(item.design.unitPrice * item.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
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
                  {formatCurrency(getTotalPrice())}
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

