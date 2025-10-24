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
                <li>Tháo ra khi tắm nước nóng hoặc đi sauna</li>
                <li>Sạc pin khi còn dưới 20%</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Lưu ý chống nước:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>IP67: Chịu được rửa tay, mưa nhẹ (KHÔNG bơi)</li>
                <li>IP68: Có thể bơi ở độ sâu 1.5m, tối đa 30 phút</li>
                <li>Tránh nước biển, nước nóng trên 40°C</li>
                <li>Không nhấn nút khi đang trong nước</li>
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
                  Lắp SIM 4G (nano SIM)
                </span>{" "}
                vào khay SIM ở mặt sau vòng tay
              </li>
              <li>
                <span className="font-medium text-foreground">Sạc đầy pin</span>{" "}
                trước lần sử dụng đầu tiên (~2 giờ)
              </li>
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
                <span className="font-medium text-foreground">
                  Cài đặt hồ sơ trẻ
                </span>
                : tên, tuổi, vùng an toàn, danh bạ SOS
              </li>
              <li>
                <span className="font-medium text-foreground">Hoàn tất!</span> Bắt
                đầu theo dõi con yêu
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Features Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Các tính năng chính
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">Định vị GPS/LBS</h3>
              <p className="text-sm text-muted-foreground">
                Xem vị trí thời gian thực, lịch sử di chuyển trên bản đồ
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">Vùng an toàn (Geo-fence)</h3>
              <p className="text-sm text-muted-foreground">
                Nhận cảnh báo khi trẻ ra/vào vùng đã cài đặt (nhà, trường)
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">Gọi thoại 2 chiều</h3>
              <p className="text-sm text-muted-foreground">
                Gọi trực tiếp từ vòng tay hoặc từ app đến vòng tay
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">Nút SOS</h3>
              <p className="text-sm text-muted-foreground">
                Giữ nút SOS 3 giây để gọi khẩn cấp đến phụ huynh
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">Đếm bước, nhắc uống nước</h3>
              <p className="text-sm text-muted-foreground">
                Theo dõi hoạt động thể chất, nhắc nhở lối sống lành mạnh
              </p>
            </div>
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
              <h3 className="font-semibold">Vòng tay không bật được:</h3>
              <p className="text-sm text-muted-foreground">
                → Sạc ít nhất 30 phút, sau đó giữ nút nguồn 3 giây
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Không kết nối được GPS:</h3>
              <p className="text-sm text-muted-foreground">
                → Đảm bảo ở ngoài trời, tránh nhà cao tầng. Đợi 2-3 phút để bắt
                tín hiệu
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Pin hết nhanh:</h3>
              <p className="text-sm text-muted-foreground">
                → Giảm tần suất cập nhật vị trí (từ 10s → 30s). Tắt tính năng
                không cần thiết
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Không gọi thoại được:</h3>
              <p className="text-sm text-muted-foreground">
                → Kiểm tra SIM có đủ cước, có bật chức năng gọi thoại không
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

