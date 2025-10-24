"use client"

import { LostChildSimulation3D } from "@/components/LostChildSimulation3D"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Shield, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>

        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-rose-500">
            Trải nghiệm 3D Đặc biệt
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hiểu Con Bạn Hơn
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Một trải nghiệm 3D immersive giúp ba mẹ cảm nhận được 
            <span className="font-semibold text-foreground"> nỗi hoảng sợ của con </span>
            khi bị lạc - và hiểu tại sao vòng tay GPS là giải pháp quan trọng.
          </p>
        </div>
      </div>

      {/* Main 3D Experience */}
      <div className="container mb-12">
        <LostChildSimulation3D />
      </div>

      {/* Context & Statistics */}
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Sự thật đau lòng
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <p className="text-4xl font-bold text-red-600 mb-1">8 triệu</p>
                <p className="text-sm text-muted-foreground">
                  trẻ em bị lạc mỗi năm trên toàn thế giới
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                <p className="text-4xl font-bold text-orange-600 mb-1">40%</p>
                <p className="text-sm text-muted-foreground">
                  trẻ em bị lạc trong các khu vui chơi công cộng
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <p className="text-4xl font-bold text-yellow-600 mb-1">90 phút</p>
                <p className="text-sm text-muted-foreground">
                  thời gian trung bình để tìm lại trẻ bị lạc (không có GPS)
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Với vòng tay GPS ARTEMIS
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                <p className="text-4xl font-bold text-green-600 mb-1">99.9%</p>
                <p className="text-sm text-muted-foreground">
                  độ chính xác định vị GPS/LBS
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-4xl font-bold text-blue-600 mb-1">Tức thì</p>
                <p className="text-sm text-muted-foreground">
                  biết vị trí con qua ứng dụng điện thoại
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                <p className="text-4xl font-bold text-purple-600 mb-1">SOS</p>
                <p className="text-sm text-muted-foreground">
                  nút khẩn cấp gửi cảnh báo ngay cho ba mẹ
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Separator className="my-12" />

        {/* Parent Testimonials */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Câu chuyện từ các bậc phụ huynh
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="mb-4">
                <div className="flex gap-1 text-yellow-400 mb-2">
                  {"⭐".repeat(5)}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;Con tôi từng bị lạc 2 tiếng ở siêu thị. Khoảng thời gian đó 
                  là địa ngục. Giờ có ARTEMIS, tôi luôn yên tâm.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold">
                  N
                </div>
                <div>
                  <p className="font-semibold">Chị Nguyễn Thảo</p>
                  <p className="text-xs text-muted-foreground">Mẹ của bé Minh, 6 tuổi</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <div className="flex gap-1 text-yellow-400 mb-2">
                  {"⭐".repeat(5)}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;Lần đầu tiên con tôi đi chơi công viên, tôi hoảng loạn không 
                  thấy con đâu. May có vòng tay GPS, tìm được con chỉ sau 3 phút!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  T
                </div>
                <div>
                  <p className="font-semibold">Anh Trần Hoàng</p>
                  <p className="text-xs text-muted-foreground">Bố của bé An, 5 tuổi</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <div className="flex gap-1 text-yellow-400 mb-2">
                  {"⭐".repeat(5)}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;Sản phẩm này không chỉ là công nghệ, mà là sự yên tâm cho 
                  ba mẹ. Trẻ thích đeo vì đẹp, mình yên tâm vì an toàn.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                  L
                </div>
                <div>
                  <p className="font-semibold">Chị Lê Mai</p>
                  <p className="text-xs text-muted-foreground">Mẹ của 2 bé</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2">Định vị chính xác</h4>
            <p className="text-sm text-muted-foreground">
              GPS + LBS + WiFi 3 lớp bảo vệ
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="font-semibold mb-2">Nút SOS khẩn cấp</h4>
            <p className="text-sm text-muted-foreground">
              Gửi cảnh báo tức thì cho phụ huynh
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold mb-2">Lịch sử di chuyển</h4>
            <p className="text-sm text-muted-foreground">
              Xem lại hành trình của con 30 ngày
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold mb-2">Thiết kế đáng yêu</h4>
            <p className="text-sm text-muted-foreground">
              Trẻ thích đeo, nhiều màu sắc
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-pink-500/10 to-purple-500/10 border-primary/20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bảo vệ con yêu ngay hôm nay
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Đừng để nỗi lo lắng cướp đi những khoảnh khắc hạnh phúc bên con. 
              Với ARTEMIS, bạn luôn biết con mình an toàn ở đâu.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link href="/products">
                  Xem sản phẩm
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link href="/guides">
                  Tìm hiểu thêm
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              ✨ Miễn phí giao hàng • Bảo hành 12 tháng • Hỗ trợ 24/7
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

