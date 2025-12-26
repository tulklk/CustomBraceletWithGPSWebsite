"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { useUser } from "@/store/useUser"
import Link from "next/link"

// Component to handle search params (needs Suspense boundary)
function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const orderId = searchParams.get("orderId")

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-orange-600" />
              <CardTitle className="text-2xl">Thanh toán đã bị hủy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-orange-800 dark:text-orange-200">
                Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu và bạn có thể thanh toán lại bất cứ lúc nào.
              </p>
            </div>

            {orderId && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                <p className="text-lg font-semibold">{orderId}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {orderId && (
                <Button asChild variant="outline">
                  <Link href={user?.accessToken ? `/account?order=${orderId}` : `/?order=${orderId}`}>
                    Xem đơn hàng
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/checkout">Thử lại thanh toán</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/products">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}

