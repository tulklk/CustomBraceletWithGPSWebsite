"use client"

import { useUser } from "@/store/useUser"
import { useCustomizer } from "@/store/useCustomizer"
import { useCart } from "@/store/useCart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Trash2, ShoppingCart, Edit, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const { user, logout, removeDesign } = useUser()
  const { setTemplate, setColor, setEngrave } = useCustomizer()
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Chưa đăng nhập</h1>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để xem thiết kế đã lưu
          </p>
          <p className="text-sm text-muted-foreground">
            (Nhấn nút "Đăng nhập" ở góc trên phải)
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

  const handleLogout = () => {
    logout()
    toast({
      title: "Đã đăng xuất",
    })
    router.push("/")
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tài khoản của tôi</h1>
            <p className="text-muted-foreground">
              Xin chào, <span className="font-semibold">{user.name}</span> ({user.email})
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Thiết kế đã lưu ({user.savedDesigns.length})
            </h2>
          </div>

          {user.savedDesigns.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Bạn chưa lưu thiết kế nào
                </p>
                <Button onClick={() => router.push("/products")}>
                  Bắt đầu thiết kế
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.savedDesigns.map((design, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="text-8xl">📍</div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{design.templateId}</Badge>
                        {design.engrave && (
                          <Badge variant="secondary">Khắc tên</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Màu: {design.colors.band} / {design.colors.face} /{" "}
                        {design.colors.rim}
                      </p>
                      {design.accessories.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {design.accessories.length} phụ kiện
                        </p>
                      )}
                      {design.engrave && (
                        <p className="text-sm text-muted-foreground">
                          "{design.engrave.text}"
                        </p>
                      )}
                    </div>

                    <p className="font-bold text-lg text-primary">
                      {formatCurrency(design.unitPrice)}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBuyAgain(index)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Mua lại
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(index)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

