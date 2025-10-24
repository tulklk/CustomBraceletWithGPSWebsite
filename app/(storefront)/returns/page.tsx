import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ReturnsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Chính sách đổi trả</h1>
          <p className="text-muted-foreground text-lg">
            Mua hàng an tâm - Đổi trả dễ dàng
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Điều kiện đổi trả</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge className="mb-2">Trong vòng 7 ngày</Badge>
              <p className="text-muted-foreground">kể từ ngày nhận hàng</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sản phẩm phải đảm bảo:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Còn nguyên tem, hộp, phụ kiện đi kèm</li>
                <li>Chưa qua sử dụng (không trầy xước, hư hỏng)</li>
                <li>Có hóa đơn mua hàng</li>
              </ul>
            </div>

            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <p className="font-semibold text-destructive mb-2">
                ⚠️ Không hỗ trợ đổi trả:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive/80">
                <li>Sản phẩm đã khắc tên theo yêu cầu</li>
                <li>Sản phẩm đã qua sử dụng, có dấu hiệu hư hỏng</li>
                <li>Quá 7 ngày kể từ khi nhận hàng</li>
                <li>Không có hóa đơn, chứng từ</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quy trình đổi trả</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3">
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Liên hệ</span>: Gọi
                hotline hoặc chat với CSKH
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Xác nhận</span>: Cung
                cấp mã đơn hàng, lý do đổi/trả
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Gửi hàng</span>: Đóng
                gói cẩn thận, gửi về địa chỉ được chỉ định
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Kiểm tra</span>: Bộ
                phận CSKH kiểm tra tình trạng sản phẩm
              </li>
              <li className="text-muted-foreground">
                <span className="font-medium text-foreground">Hoàn tiền/Đổi hàng</span>:
                Trong 3-5 ngày làm việc
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phí đổi trả</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <span className="font-medium">Lỗi từ nhà sản xuất:</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                Miễn phí 100%
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Đổi ý không mua:</span>
              <Badge variant="outline">Khách chịu phí ship</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Đổi size, màu:</span>
              <Badge variant="outline">Khách chịu phí ship</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoàn tiền</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">
              Thời gian hoàn tiền: <span className="font-semibold">3-7 ngày làm việc</span>
            </p>
            <p className="text-muted-foreground">
              Hình thức: Chuyển khoản về tài khoản đã thanh toán hoặc nhận tiền mặt
              tại cửa hàng
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-6 text-center">
            <p className="font-semibold mb-2">Hotline đổi trả: 1900 xxxx (demo)</p>
            <p className="text-sm text-muted-foreground">Email: returns@artemis.vn</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

