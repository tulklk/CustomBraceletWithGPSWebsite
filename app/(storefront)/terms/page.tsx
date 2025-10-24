import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Badge className="mb-4">Demo Website</Badge>
          <h1 className="text-4xl font-bold mb-4">Điều khoản sử dụng</h1>
          <p className="text-muted-foreground">
            Cập nhật lần cuối: Tháng 10, 2025
          </p>
        </div>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>⚠️ Lưu ý quan trọng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold text-destructive">
              ĐÂY LÀ WEBSITE DEMO - KHÔNG PHẢI DỊCH VỤ THẬT
            </p>
            <p className="text-muted-foreground">
              Website này được xây dựng cho mục đích minh họa UI/UX và tính năng.
              Không có giao dịch thật diễn ra. Mọi thông tin, sản phẩm, giá cả đều
              là giả lập.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>1. Chấp nhận điều khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bằng việc sử dụng website này, bạn đồng ý với các điều khoản được liệt
              kê dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Sử dụng dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">Bạn cam kết:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Cung cấp thông tin chính xác khi đăng ký</li>
                <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                <li>Không can thiệp vào hệ thống, mạng của website</li>
                <li>Bảo mật thông tin đăng nhập của bạn</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Quyền sở hữu trí tuệ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mọi nội dung trên website (văn bản, hình ảnh, logo, mã nguồn) đều
              thuộc quyền sở hữu của ARTEMIS (demo). Nghiêm cấm sao chép, phân phối
              mà không có sự cho phép bằng văn bản.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Trách nhiệm của người dùng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">
              Bạn chịu trách nhiệm về mọi hoạt động dưới tài khoản của mình. Trong
              trường hợp phát hiện hành vi truy cập trái phép, vui lòng thông báo
              ngay.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Giới hạn trách nhiệm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">
              Website không chịu trách nhiệm về:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Thiệt hại gián tiếp, ngẫu nhiên do sử dụng dịch vụ</li>
              <li>Gián đoạn dịch vụ do bảo trì, nâng cấp</li>
              <li>Lỗi kỹ thuật nằm ngoài tầm kiểm soát</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Thay đổi điều khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chúng tôi có quyền cập nhật, sửa đổi điều khoản bất cứ lúc nào. Phiên
              bản mới nhất luôn được đăng tại trang này. Việc tiếp tục sử dụng dịch
              vụ sau khi cập nhật có nghĩa bạn chấp nhận điều khoản mới.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Liên hệ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">
              Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:
            </p>
            <p className="font-medium">Email: legal@kidtrack.vn (demo)</p>
            <p className="font-medium">Hotline: 1900 xxxx</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

