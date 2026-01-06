import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function GuidesPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Hướng dẫn sử dụng</h1>
          <p className="text-muted-foreground text-lg">
            Mọi thứ bạn cần biết về ARTEMIS Bracelets
          </p>
        </div>

        {/* Size Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📏 Hướng dẫn chọn size vòng tay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <Badge className="mb-2">Size S</Badge>
                <p className="font-semibold">12-14cm</p>
                <p className="text-sm text-muted-foreground">
                  Trẻ 3-5 tuổi
                </p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <Badge className="mb-2">Size M</Badge>
                <p className="font-semibold">14-16cm</p>
                <p className="text-sm text-muted-foreground">
                  Trẻ 6-8 tuổi
                </p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <Badge className="mb-2">Size L</Badge>
                <p className="font-semibold">16-18cm</p>
                <p className="text-sm text-muted-foreground">
                  Trẻ 9-12 tuổi
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Cách đo:</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Dùng thước dây đo chu vi cổ tay trẻ</li>
                <li>Đo ở vị trí đeo vòng tay (phía trên xương cổ tay)</li>
                <li>Cộng thêm 1-1.5cm để thoải mái</li>
                <li>Đối chiếu với bảng size để chọn kích cỡ phù hợp</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Care Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧼 Hướng dẫn bảo quản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Làm sạch:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Lau bằng khăn mềm ẩm hàng ngày</li>
                <li>Dùng nước xà phòng nhẹ nếu cần</li>
                <li>Không dùng chất tẩy rửa mạnh, cồn, hoặc dung môi hóa học</li>
                <li>Lau khô sau khi tiếp xúc nước</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Bảo quản:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Tránh để ở nơi nhiệt độ cao (trên 50°C)</li>
                <li>Không để tiếp xúc trực tiếp ánh nắng mặt trời lâu</li>
                <li>Tháo ra khi tắm nước nóng hoặc đi tắm hơi</li>
                <li>Sạc pin khi còn dưới 20%</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚙️ Hướng dẫn thiết lập ban đầu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Tải ứng dụng ARTEMIS
                </span>{" "}
                trên App Store hoặc Google Play
              </li>
              <li>
                <span className="font-medium text-foreground">Đăng ký tài khoản</span>{" "}
                bằng email hoặc số điện thoại
              </li>
              <li>
                <span className="font-medium text-foreground">Quét mã QR</span> trên
                hộp sản phẩm để ghép nối vòng tay
              </li>
              <li>
                <span className="font-medium text-foreground">Hoàn tất!</span> Bắt
                đầu theo dõi con yêu
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Xử lý sự cố thường gặp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold">Không kết nối được GPS:</h3>
              <p className="text-sm text-muted-foreground">
                → Đảm bảo ở ngoài trời, tránh nhà cao tầng. Đợi 2-3 phút để bắt
                tín hiệu
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

