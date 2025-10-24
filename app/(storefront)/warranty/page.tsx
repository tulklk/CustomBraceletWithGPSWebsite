import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Clock, Package } from "lucide-react"

export default function WarrantyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Chính sách bảo hành</h1>
          <p className="text-muted-foreground text-lg">
            Cam kết chất lượng - Hỗ trợ tận tâm
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">12 tháng</h3>
              <p className="text-sm text-muted-foreground">Bảo hành lỗi kỹ thuật</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">6 tháng</h3>
              <p className="text-sm text-muted-foreground">Bảo hành pin</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3 tháng</h3>
              <p className="text-sm text-muted-foreground">Miễn phí thay dây</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Điều kiện bảo hành</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">✓</Badge> Được bảo hành
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Lỗi kỹ thuật do nhà sản xuất</li>
                <li>Pin chai, sụt dung lượng bất thường (trong 6 tháng)</li>
                <li>Dây đeo đứt, phai màu (trong 3 tháng)</li>
                <li>Lỗi màn hình, cảm ứng</li>
                <li>Không nhận SIM, GPS không hoạt động</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="destructive">✗</Badge> Không bảo hành
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Hư hỏng do rơi vỡ, va đập mạnh</li>
                <li>Ngấm nước vượt chuẩn IP (ngâm nước lâu, nước biển)</li>
                <li>Tự ý tháo máy, sửa chữa không ủy quyền</li>
                <li>Tem bảo hành bị rách, mờ, không còn</li>
                <li>Trầy xước do sử dụng thường ngày</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quy trình bảo hành</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3">
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Liên hệ</span>: Gọi
                hotline hoặc gửi email mô tả lỗi
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Gửi sản phẩm</span>:
                Gửi về trung tâm bảo hành (miễn phí ship nếu còn BH)
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Kiểm tra</span>: Kỹ
                thuật viên xác định lỗi (1-2 ngày)
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Sửa chữa/Thay thế</span>:
                5-7 ngày làm việc
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Giao trả</span>: Ship
                miễn phí về địa chỉ đăng ký
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hỗ trợ kỹ thuật trọn đời</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ngay cả khi hết thời gian bảo hành, chúng tôi vẫn hỗ trợ:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Tư vấn sử dụng, cài đặt</li>
              <li>Sửa chữa có tính phí linh kiện</li>
              <li>Cập nhật firmware miễn phí</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-6 text-center">
            <p className="font-semibold mb-2">Hotline bảo hành: 1900 xxxx (demo)</p>
            <p className="text-sm text-muted-foreground">
              Email: warranty@artemis.vn
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

