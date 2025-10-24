import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Badge className="mb-4">Demo Website</Badge>
          <h1 className="text-4xl font-bold mb-4">Chính sách bảo mật dữ liệu</h1>
          <p className="text-muted-foreground">
            Cập nhật lần cuối: Tháng 10, 2025
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>⚠️ Lưu ý quan trọng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-destructive">
              Đây là WEBSITE DEMO - KHÔNG thu thập dữ liệu thực tế
            </p>
            <p>
              Website này được xây dựng cho mục đích minh họa giao diện và tính
              năng. Mọi dữ liệu được lưu trữ tại localStorage của trình duyệt,
              không gửi về server.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Không thu thập thông tin cá nhân thực tế</li>
              <li>Không thu thập dữ liệu vị trí trẻ em</li>
              <li>Không xử lý thanh toán thật</li>
              <li>Mọi đơn hàng, tài khoản đều là mock/giả lập</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dữ liệu được lưu (localStorage)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">Giỏ hàng (artemis-cart)</h3>
              <p className="text-sm text-muted-foreground">
                Lưu danh sách sản phẩm trong giỏ để persist giữa các session
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Thông tin người dùng (artemis-user)
              </h3>
              <p className="text-sm text-muted-foreground">
                Lưu email, tên, và danh sách thiết kế đã lưu (mock)
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Lịch sử chat (artemis-chat)</h3>
              <p className="text-sm text-muted-foreground">
                Lưu tin nhắn chat để hiển thị lại khi mở lại trang
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chính sách bảo mật cho sản phẩm thật</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nếu đây là sản phẩm thương mại thực tế, chúng tôi cam kết:
            </p>
            <ul>
              <li>
                <strong>Bảo vệ dữ liệu vị trí:</strong> Chỉ phụ huynh được ủy
                quyền mới xem được vị trí trẻ em
              </li>
              <li>
                <strong>Mã hóa:</strong> Mọi dữ liệu truyền tải đều được mã hóa
                SSL/TLS
              </li>
              <li>
                <strong>Không chia sẻ:</strong> Không bán hoặc chia sẻ dữ liệu cá
                nhân cho bên thứ ba
              </li>
              <li>
                <strong>Quyền truy cập:</strong> Phụ huynh có quyền yêu cầu xóa
                toàn bộ dữ liệu
              </li>
              <li>
                <strong>Tuân thủ GDPR, COPPA:</strong> Bảo vệ quyền riêng tư trẻ
                em
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liên hệ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ:
            </p>
            <p className="font-medium mt-2">privacy@artemis.vn (demo)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

