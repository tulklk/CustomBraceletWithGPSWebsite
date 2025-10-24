import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BraceletImage } from "@/components/BraceletImage"
import {
  Shield,
  Droplet,
  Battery,
  MapPin,
  Sparkles,
  Heart,
} from "lucide-react"
import { Product, Template } from "@/lib/types"

// Mock data - same as API routes
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'artemis-mini',
    name: 'ARTEMIS Mini',
    slug: 'artemis-mini',
    priceFrom: 1200000,
    images: ['/images/products/mini-1.svg', '/images/products/mini-2.svg'],
    specs: {
      waterproof: 'IP67',
      battery: '400mAh - 3-5 ngày',
      gps: true,
      simCard: true,
      weight: '35g',
    },
    description: 'Vòng tay thông minh nhỏ gọn, phù hợp cho trẻ 3-8 tuổi. Tích hợp GPS/LBS, gọi thoại 2 chiều, và SOS khẩn cấp.',
    features: [
      'Định vị GPS/LBS chính xác',
      'Gọi thoại 2 chiều',
      'Nút SOS khẩn cấp',
      'Chống nước IP67',
      'Pin 3-5 ngày',
      'Thiết kế nhẹ, thoải mái',
    ],
  },
  {
    id: 'artemis-active',
    name: 'ARTEMIS Active',
    slug: 'artemis-active',
    priceFrom: 1800000,
    images: ['/images/products/active-1.svg', '/images/products/active-2.svg'],
    specs: {
      waterproof: 'IP68',
      battery: '500mAh - 5-7 ngày',
      gps: true,
      simCard: true,
      weight: '42g',
    },
    description: 'Phiên bản cao cấp với GPS 4G, camera, và chống nước IP68. Lý tưởng cho trẻ năng động 6-12 tuổi.',
    features: [
      'GPS 4G tốc độ cao',
      'Camera chụp ảnh từ xa',
      'Chống nước IP68 (bơi lội)',
      'Đếm bước, nhắc uống nước',
      'Pin 5-7 ngày',
      'Màn hình màu cảm ứng',
    ],
  },
  {
    id: 'artemis-pro',
    name: 'ARTEMIS Pro',
    slug: 'artemis-pro',
    priceFrom: 2400000,
    images: ['/images/products/pro-1.svg', '/images/products/pro-2.svg'],
    specs: {
      waterproof: 'IP68',
      battery: '600mAh - 7-10 ngày',
      gps: true,
      simCard: true,
      weight: '48g',
    },
    description: 'Phiên bản cao cấp nhất với GPS 5G, video call, AI nhận dạng, và nhiều tính năng thông minh. Dành cho trẻ 8-15 tuổi.',
    features: [
      'GPS 5G siêu chính xác',
      'Video call HD 2-way',
      'AI phát hiện ngã/va chạm',
      'Màn hình AMOLED cảm ứng',
      'Pin 7-10 ngày',
      'Sạc không dây',
      'Theo dõi sức khỏe nâng cao',
    ],
  },
  {
    id: 'artemis-lite',
    name: 'ARTEMIS Lite',
    slug: 'artemis-lite',
    priceFrom: 899000,
    images: ['/images/products/lite-1.svg', '/images/products/lite-2.svg'],
    specs: {
      waterproof: 'IP65',
      battery: '350mAh - 2-4 ngày',
      gps: true,
      simCard: false,
      weight: '28g',
    },
    description: 'Phiên bản giá rẻ, nhẹ nhàng cho trẻ nhỏ 3-6 tuổi. GPS cơ bản, SOS, không cần SIM card.',
    features: [
      'GPS/LBS cơ bản',
      'Nút SOS một chạm',
      'Kết nối Bluetooth với điện thoại',
      'Siêu nhẹ chỉ 28g',
      'Giá cả phải chăng',
      'Dễ sử dụng',
    ],
  },
  {
    id: 'artemis-sport',
    name: 'ARTEMIS Sport',
    slug: 'artemis-sport',
    priceFrom: 1650000,
    images: ['/images/products/sport-1.svg', '/images/products/sport-2.svg'],
    specs: {
      waterproof: 'IP68',
      battery: '550mAh - 6-8 ngày',
      gps: true,
      simCard: true,
      weight: '40g',
    },
    description: 'Thiết kế thể thao năng động, theo dõi hoạt động thể chất. Chống va đập, phù hợp trẻ 7-14 tuổi yêu thích vận động.',
    features: [
      'Theo dõi hoạt động thể thao',
      'Đếm bước, calo, quãng đường',
      'Chống va đập, chống nước IP68',
      'Đo nhịp tim liên tục',
      'Chế độ thể thao đa dạng',
      'Khung viền siêu bền',
    ],
  },
  {
    id: 'artemis-princess',
    name: 'ARTEMIS Princess',
    slug: 'artemis-princess',
    priceFrom: 1550000,
    images: ['/images/products/princess-1.svg', '/images/products/princess-2.svg'],
    specs: {
      waterproof: 'IP67',
      battery: '450mAh - 4-6 ngày',
      gps: true,
      simCard: true,
      weight: '36g',
    },
    description: 'Thiết kế đặc biệt cho bé gái với màu sắc pastel, họa tiết công chúa, unicorn. Đầy đủ tính năng an toàn. Độ tuổi 4-10.',
    features: [
      'Thiết kế công chúa độc quyền',
      'Màu sắc pastel dịu nhẹ',
      'GPS an toàn chính xác',
      'Gọi thoại rõ ràng',
      'Kèm charm unicorn & công chúa',
      'Hộp quà sang trọng',
    ],
  },
  {
    id: 'artemis-explorer',
    name: 'ARTEMIS Explorer',
    slug: 'artemis-explorer',
    priceFrom: 1950000,
    images: ['/images/products/explorer-1.svg', '/images/products/explorer-2.svg'],
    specs: {
      waterproof: 'IP68',
      battery: '580mAh - 6-9 ngày',
      gps: true,
      simCard: true,
      weight: '44g',
    },
    description: 'Dành cho trẻ thích phiêu lưu và khám phá. Tích hợp la bàn, nhiệt kế, cao độ kế. Thiết kế bền bỉ. Độ tuổi 8-14.',
    features: [
      'La bàn điện tử tích hợp',
      'Nhiệt kế & cao độ kế',
      'GPS kép (GPS + GLONASS)',
      'Chống sốc quân đội',
      'Đèn pin LED tích hợp',
      'Chế độ ngoài trời',
    ],
  },
  {
    id: 'artemis-teen',
    name: 'ARTEMIS Teen',
    slug: 'artemis-teen',
    priceFrom: 2100000,
    images: ['/images/products/teen-1.svg', '/images/products/teen-2.svg'],
    specs: {
      waterproof: 'IP68',
      battery: '620mAh - 7-10 ngày',
      gps: true,
      simCard: true,
      weight: '46g',
    },
    description: 'Thiết kế trưởng thành cho teen 13-18 tuổi. Màn hình lớn, nhiều ứng dụng, vẫn giữ tính năng an toàn cho phụ huynh.',
    features: [
      'Thiết kế trẻ trung, hiện đại',
      'Màn hình 1.4 inch cảm ứng',
      'Thông báo mạng xã hội',
      'Thanh toán điện tử',
      'Chế độ riêng tư cho teen',
      'GPS bảo mật cao',
    ],
  },
  {
    id: 'artemis-baby',
    name: 'ARTEMIS Baby',
    slug: 'artemis-baby',
    priceFrom: 799000,
    images: ['/images/products/baby-1.svg', '/images/products/baby-2.svg'],
    specs: {
      waterproof: 'IP65',
      battery: '300mAh - 2-3 ngày',
      gps: true,
      simCard: false,
      weight: '25g',
    },
    description: 'Dành cho trẻ sơ sinh đến 3 tuổi. Siêu nhẹ, an toàn tuyệt đối, chất liệu y tế. Giám sát vị trí qua Bluetooth.',
    features: [
      'Siêu nhẹ chỉ 25g',
      'Chất liệu an toàn cho da trẻ',
      'Bluetooth tracking',
      'Cảm biến nhiệt độ',
      'Thiết kế đáng yêu',
      'Không cần SIM card',
    ],
  },
  {
    id: 'artemis-smart',
    name: 'ARTEMIS Smart',
    slug: 'artemis-smart',
    priceFrom: 1750000,
    images: ['/images/products/smart-1.svg', '/images/products/smart-2.svg'],
    specs: {
      waterproof: 'IP67',
      battery: '500mAh - 5-7 ngày',
      gps: true,
      simCard: true,
      weight: '42g',
    },
    description: 'Phiên bản thông minh với trợ lý AI, nhận diện giọng nói, dịch thuật tức thì. Độ tuổi 8-14.',
    features: [
      'Trợ lý AI tích hợp',
      'Nhận diện giọng nói',
      'Dịch thuật đa ngôn ngữ',
      'Tính năng học tập',
      'Nhắc nhở thông minh',
      'GPS chính xác cao',
    ],
  },
  {
    id: 'artemis-adventure',
    name: 'ARTEMIS Adventure',
    slug: 'artemis-adventure',
    priceFrom: 1850000,
    images: ['/images/products/adventure-1.svg', '/images/products/adventure-2.svg'],
    specs: {
      waterproof: 'IP68',
      battery: '600mAh - 7-9 ngày',
      gps: true,
      simCard: true,
      weight: '45g',
    },
    description: 'Dành cho trẻ năng động thích phiêu lưu. Chống sốc cực mạnh, nhiều cảm biến ngoài trời. Độ tuổi 9-15.',
    features: [
      'Khung nhôm chống sốc',
      'Đèn LED 3 chế độ',
      'Cảm biến nhiệt độ & độ cao',
      'La bàn điện tử',
      'SOS khẩn cấp nâng cao',
      'Chế độ sinh tồn',
    ],
  },
  {
    id: 'artemis-fashion',
    name: 'ARTEMIS Fashion',
    slug: 'artemis-fashion',
    priceFrom: 1650000,
    images: ['/images/products/fashion-1.svg', '/images/products/fashion-2.svg'],
    specs: {
      waterproof: 'IP67',
      battery: '480mAh - 5-7 ngày',
      gps: true,
      simCard: true,
      weight: '38g',
    },
    description: 'Thiết kế thời trang cao cấp, dây da cao cấp có thể thay đổi. Phù hợp cho cả trẻ và người lớn. Độ tuổi 10+.',
    features: [
      'Thiết kế thời trang sang trọng',
      'Dây da cao cấp thay được',
      'Nhiều màu sắc trendy',
      'Viền kim loại sang',
      'Màn hình cảm ứng đẹp',
      'Tính năng đầy đủ',
    ],
  },
]

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'sport',
    name: 'Sport',
    basePrice: 1200000,
    defaultColors: {
      band: 'blue',
      face: 'white',
      rim: 'blue',
    },
    recommendedAccessories: ['star', 'soccer'],
    preview: '/images/templates/sport.svg',
    description: 'Phong cách thể thao năng động, phù hợp với trẻ năng động',
  },
  {
    id: 'cute',
    name: 'Cute',
    basePrice: 1200000,
    defaultColors: {
      band: 'pink',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['heart', 'bear', 'unicorn'],
    preview: '/images/templates/cute.svg',
    description: 'Thiết kế dễ thương, ngọt ngào cho bé gái',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    basePrice: 1400000,
    defaultColors: {
      band: 'purple',
      face: 'black',
      rim: 'cyan',
    },
    recommendedAccessories: ['star', 'rocket', 'planet'],
    preview: '/images/templates/galaxy.svg',
    description: 'Chủ đề vũ trụ huyền bí, kích thích trí tưởng tượng',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    basePrice: 1100000,
    defaultColors: {
      band: 'black',
      face: 'white',
      rim: 'gray',
    },
    recommendedAccessories: [],
    preview: '/images/templates/minimal.svg',
    description: 'Thiết kế tối giản, thanh lịch, phù hợp mọi lứa tuổi',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    basePrice: 1300000,
    defaultColors: {
      band: 'cyan',
      face: 'white',
      rim: 'blue',
    },
    recommendedAccessories: ['dolphin', 'shell'],
    preview: '/images/templates/ocean.svg',
    description: 'Chủ đề đại dương tươi mát, năng động',
  },
  {
    id: 'dino',
    name: 'Dinosaur',
    basePrice: 1250000,
    defaultColors: {
      band: 'green',
      face: 'white',
      rim: 'green',
    },
    recommendedAccessories: ['dino', 'egg'],
    preview: '/images/templates/dino.svg',
    description: 'Khủng long đáng yêu cho bé thích khám phá',
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    basePrice: 1350000,
    defaultColors: {
      band: 'purple',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['unicorn', 'rainbow', 'star'],
    preview: '/images/templates/unicorn.svg',
    description: 'Kỳ lân thần tiên, lung linh sắc màu',
  },
]

export default function HomePage() {
  const products = MOCK_PRODUCTS
  const templates = MOCK_TEMPLATES

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-20 lg:py-32">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <Badge className="w-fit text-xs md:text-sm">✨ Tùy biến theo cá tính</Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                An tâm theo dõi con yêu mọi lúc mọi nơi
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
                Thiết kế vòng tay GPS độc nhất cho bé với hàng trăm tùy chọn màu sắc,
                phụ kiện và khắc tên. Công nghệ định vị hiện đại, an toàn tuyệt đối.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/products">Bắt đầu thiết kế</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/guides">Tìm hiểu thêm</Link>
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center p-8 md:p-12">
                <BraceletImage theme="cute" size={400} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/40">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Tại sao chọn ARTEMIS?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              An toàn - Thời trang - Công nghệ
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Định vị GPS/4G chính xác</h3>
                <p className="text-muted-foreground">
                  Theo dõi vị trí thời gian thực, lịch sử di chuyển, vùng an toàn
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Droplet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Chống nước IP67/IP68</h3>
                <p className="text-muted-foreground">
                  Thoải mái rửa tay, đi mưa, thậm chí bơi lội (IP68)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Battery className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Pin bền 3-7 ngày</h3>
                <p className="text-muted-foreground">
                  Không lo hết pin giữa chừng, sạc nhanh chỉ 2 giờ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">SOS khẩn cấp</h3>
                <p className="text-muted-foreground">
                  Nút cứu hộ 1 chạm, gọi ngay cho phụ huynh
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Tùy biến không giới hạn</h3>
                <p className="text-muted-foreground">
                  Hàng trăm tùy chọn màu, phụ kiện, khắc tên theo sở thích
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Bảo hành 12 tháng</h3>
                <p className="text-muted-foreground">
                  Hỗ trợ kỹ thuật trọn đời, đổi trả miễn phí trong 7 ngày
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Sản phẩm của chúng tôi
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Chọn mẫu phù hợp rồi bắt đầu thiết kế
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                featured={index === 0 || index === 2}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">
                Xem tất cả {products.length} sản phẩm
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/40">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Mẫu thiết kế nổi bật
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Cảm hứng từ cộng đồng ARTEMIS
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {templates.slice(0, 4).map((template: any) => (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <Link href={`/products`}>
                  <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
                    <BraceletImage 
                      theme={template.id as any} 
                      size={200} 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/products">Xem tất cả mẫu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Comparison */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              So sánh nhanh sản phẩm
            </h2>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Tìm sản phẩm phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
                <table className="min-w-full divide-y divide-border text-sm md:text-base">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold whitespace-nowrap">Sản phẩm</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold whitespace-nowrap">Độ tuổi</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold">Tính năng nổi bật</th>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold whitespace-nowrap">Giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Lite 💚</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">3-6 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Nhẹ nhất, giá tốt nhất</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">899.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Mini ⭐</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">3-8 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Bán chạy, cân bằng giá & tính năng</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.200.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Princess 👑</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">4-10 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Dành cho bé gái, thiết kế công chúa</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.550.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Sport 🏃</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">7-14 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Theo dõi thể thao, chống va đập</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.650.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Active ⭐</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">6-12 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Camera, chống nước IP68</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.800.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Explorer 🧭</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">8-14 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">La bàn, nhiệt kế, ngoài trời</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.950.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Teen 📱</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">13-18 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Thiết kế teen, thanh toán điện tử</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">2.100.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Pro 🔥</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">8-15 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Cao cấp nhất, GPS 5G, Video call</td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">2.400.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Baby 🍼</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">0-3 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Siêu nhẹ 25g, Bluetooth tracking</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">799.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Smart 🤖</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">8-14 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Trợ lý AI, nhận diện giọng nói</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.750.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Adventure 🏔️</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">9-15 tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Chống sốc, đèn LED, la bàn</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.850.000₫</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-xs md:text-sm whitespace-nowrap">ARTEMIS Fashion 👗</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">10+ tuổi</td>
                      <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm">Thiết kế thời trang, dây da cao cấp</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">1.650.000₫</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Phụ huynh nói gì về chúng tôi
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: "Chị Hương",
                role: "Mẹ của bé Minh An",
                content:
                  "Con rất thích vòng tay mình tự thiết kế. Tôi an tâm hơn khi biết con đang ở đâu mọi lúc.",
              },
              {
                name: "Anh Tuấn",
                role: "Bố của bé Phương Anh",
                content:
                  "Chất lượng tốt, pin trâu, chống nước hiệu quả. Con đeo cả khi bơi vẫn ok!",
              },
              {
                name: "Cô Lan",
                role: "Giáo viên mầm non",
                content:
                  "Nhiều phụ huynh trong lớp dùng ARTEMIS. Thiết kế đẹp, tính năng hữu ích!",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng bảo vệ con yêu?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Bắt đầu thiết kế vòng tay độc nhất ngay hôm nay
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/products">Khám phá ngay</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

