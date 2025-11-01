import Link from "next/link"
import Image from "next/image"
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
    id: 'bunny-baby-pink',
    name: 'ARTEMIS Bunny Baby Pink',
    slug: 'bunny-baby-pink',
    priceFrom: 499000,
    images: ['/images/templates/bunny-baby-pink.png'],
    specs: {
      waterproof: 'IP67',
      battery: '400mAh - 3-5 ngày',
      gps: true,
      simCard: true,
      weight: '35g',
    },
    description: 'Thỏ hồng đáng yêu với họa tiết hoa và tim, dành cho bé gái năng động. Thiết kế độc quyền với màu hồng pastel ngọt ngào.',
    features: [
      'Định vị GPS/LBS chính xác',
      'Thiết kế Bunny độc quyền',
      'Họa tiết hoa & tim đáng yêu',
      'Chống nước IP67',
      'Pin 3-5 ngày',
      'Màu hồng pastel dịu nhẹ',
    ],
  },
  {
    id: 'bunny-lavender',
    name: 'ARTEMIS Bunny Lavender',
    slug: 'bunny-lavender',
    priceFrom: 499000,
    images: ['/images/templates/bunny-lavender.png'],
    specs: {
      waterproof: 'IP67',
      battery: '400mAh - 3-5 ngày',
      gps: true,
      simCard: true,
      weight: '35g',
    },
    description: 'Thỏ tím pastel với họa tiết chấm tròn đầy màu sắc, dễ thương và sáng tạo. Phù hợp cho bé yêu thích sự độc đáo.',
    features: [
      'Định vị GPS/LBS chính xác',
      'Thiết kế Bunny sáng tạo',
      'Họa tiết chấm tròn đa màu',
      'Chống nước IP67',
      'Pin 3-5 ngày',
      'Màu tím lavender trendy',
    ],
  },
  {
    id: 'bunny-yellow',
    name: 'ARTEMIS Bunny Yellow',
    slug: 'bunny-yellow',
    priceFrom: 499000,
    images: ['/images/templates/bunny-yellow.png'],
    specs: {
      waterproof: 'IP67',
      battery: '400mAh - 3-5 ngày',
      gps: true,
      simCard: true,
      weight: '35g',
    },
    description: 'Thỏ vàng tươi với cà rốt và lá, năng lượng tích cực cho bé. Thiết kế tràn đầy sức sống và vui tươi.',
    features: [
      'Định vị GPS/LBS chính xác',
      'Thiết kế Bunny năng động',
      'Họa tiết cà rốt & lá cây',
      'Chống nước IP67',
      'Pin 3-5 ngày',
      'Màu vàng cam tươi sáng',
    ],
  },
  {
    id: 'bunny-mint',
    name: 'ARTEMIS Bunny Mint',
    slug: 'bunny-mint',
    priceFrom: 499000,
    images: ['/images/templates/bunny-mint.png'],
    specs: {
      waterproof: 'IP67',
      battery: '400mAh - 3-5 ngày',
      gps: true,
      simCard: true,
      weight: '35g',
    },
    description: 'Thỏ xanh mint tươi mát với họa tiết lá và hoa, thanh lịch và dịu dàng. Màu sắc dễ chịu cho mắt.',
    features: [
      'Định vị GPS/LBS chính xác',
      'Thiết kế Bunny thanh lịch',
      'Họa tiết lá & hoa tự nhiên',
      'Chống nước IP67',
      'Pin 3-5 ngày',
      'Màu xanh mint dịu mắt',
    ],
  },
  {
    id: 'bunny-pink',
    name: 'ARTEMIS Bunny Green',
    slug: 'bunny-pink',
    priceFrom: 499000,
    images: ['/images/templates/bunny-pink.png'],
    specs: {
      waterproof: 'IP67',
      battery: '400mAh - 3-5 ngày',
      gps: true,
      simCard: true,
      weight: '35g',
    },
    description: 'Thỏ hồng pastel đơn giản, nhẹ nhàng và dễ thương nhất. Thiết kế tối giản cho bé yêu thích sự nhẹ nhàng.',
    features: [
      'Định vị GPS/LBS chính xác',
      'Thiết kế Bunny tối giản',
      'Màu sắc pastel nhẹ nhàng',
      'Chống nước IP67',
      'Pin 3-5 ngày',
      'Giá ưu đãi nhất',
    ],
  },
  {
    id: 'necklace-baby-pink',
    name: 'ARTEMIS Dây Chuyền Bunny Baby Pink',
    slug: 'necklace-baby-pink',
    priceFrom: 375000,
    images: ['/images/necklaces/necklace-baby-pink.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '15g',
    },
    description: 'Dây chuyền thỏ hồng baby dễ thương với thiết kế tối giản, phù hợp làm quà tặng hoặc phụ kiện thời trang.',
    features: [
      'Thiết kế Bunny đáng yêu',
      'Chất liệu an toàn cho trẻ',
      'Màu hồng pastel nhẹ nhàng',
      'Dây chuyền inox không gỉ',
      'Mặt pendant chống nước',
      'Giá cả phải chăng',
    ],
  },
  {
    id: 'necklace-pink',
    name: 'ARTEMIS Dây Chuyền Bunny Pink',
    slug: 'necklace-pink',
    priceFrom: 375000,
    images: ['/images/necklaces/necklace-pink.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '15g',
    },
    description: 'Dây chuyền thỏ hồng fuchsia với họa tiết hoa đầy màu sắc, thiết kế vui tươi và năng động.',
    features: [
      'Thiết kế Bunny năng động',
      'Họa tiết hoa đa màu sắc',
      'Màu hồng fuchsia nổi bật',
      'Dây chuyền inox không gỉ',
      'Mặt pendant chống nước',
      'Phù hợp mọi lứa tuổi',
    ],
  },
  {
    id: 'necklace-lavender',
    name: 'ARTEMIS Dây Chuyền Bunny Lavender',
    slug: 'necklace-lavender',
    priceFrom: 375000,
    images: ['/images/necklaces/necklace-lavender.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '15g',
    },
    description: 'Dây chuyền thỏ tím lavender với họa tiết hoa và chấm tròn, phong cách dịu dàng và thanh lịch.',
    features: [
      'Thiết kế Bunny thanh lịch',
      'Họa tiết hoa & chấm tròn',
      'Màu tím lavender trendy',
      'Dây chuyền inox không gỉ',
      'Mặt pendant chống nước',
      'Thời trang và cá tính',
    ],
  },
  {
    id: 'necklace-yellow',
    name: 'ARTEMIS Dây Chuyền Bunny Yellow',
    slug: 'necklace-yellow',
    priceFrom: 375000,
    images: ['/images/necklaces/necklace-yellow.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '15g',
    },
    description: 'Dây chuyền thỏ vàng với họa tiết cà rốt, mang năng lượng tích cực và vui tươi.',
    features: [
      'Thiết kế Bunny vui tươi',
      'Họa tiết cà rốt đáng yêu',
      'Màu vàng cam tươi sáng',
      'Dây chuyền inox không gỉ',
      'Mặt pendant chống nước',
      'Phong cách năng động',
    ],
  },
  {
    id: 'necklace-mint',
    name: 'ARTEMIS Dây Chuyền Bunny Mint',
    slug: 'necklace-mint',
    priceFrom: 375000,
    images: ['/images/necklaces/necklace-mint.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '15g',
    },
    description: 'Dây chuyền thỏ xanh mint với họa tiết hoa và lá tự nhiên, tươi mát và dễ chịu.',
    features: [
      'Thiết kế Bunny tự nhiên',
      'Họa tiết hoa & lá cây',
      'Màu xanh mint dịu mắt',
      'Dây chuyền inox không gỉ',
      'Mặt pendant chống nước',
      'Phong cách thanh lịch',
    ],
  },
  {
    id: 'clip-baby-pink',
    name: 'ARTEMIS Pin Kẹp Bunny Baby Pink',
    slug: 'clip-baby-pink',
    priceFrom: 299000,
    images: ['/images/clips/clip-baby-pink.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '12g',
    },
    description: 'Pin kẹp thỏ hồng baby dễ thương, kẹp lên quần áo, ba lô hoặc mũ. Thiết kế an toàn cho trẻ.',
    features: [
      'Thiết kế Bunny đáng yêu',
      'Kẹp chắc chắn, an toàn',
      'Màu hồng pastel nhẹ nhàng',
      'Chất liệu không độc hại',
      'Dễ dàng tháo lắp',
      'Phù hợp làm phụ kiện',
    ],
  },
  {
    id: 'clip-pink',
    name: 'ARTEMIS Pin Kẹp Bunny Pink',
    slug: 'clip-pink',
    priceFrom: 299000,
    images: ['/images/clips/clip-pink.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '12g',
    },
    description: 'Pin kẹp thỏ hồng fuchsia với họa tiết hoa và tim đầy màu sắc, vui tươi và năng động.',
    features: [
      'Thiết kế Bunny năng động',
      'Họa tiết hoa & tim đáng yêu',
      'Màu hồng fuchsia nổi bật',
      'Kẹp chắc chắn, an toàn',
      'Chất liệu không độc hại',
      'Phù hợp làm phụ kiện',
    ],
  },
  {
    id: 'clip-lavender',
    name: 'ARTEMIS Pin Kẹp Bunny Lavender',
    slug: 'clip-lavender',
    priceFrom: 299000,
    images: ['/images/clips/clip-lavender.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '12g',
    },
    description: 'Pin kẹp thỏ tím lavender với họa tiết hoa đa màu, phong cách dịu dàng và thanh lịch.',
    features: [
      'Thiết kế Bunny thanh lịch',
      'Họa tiết hoa đa màu sắc',
      'Màu tím lavender trendy',
      'Kẹp chắc chắn, an toàn',
      'Chất liệu không độc hại',
      'Thời trang và cá tính',
    ],
  },
  {
    id: 'clip-yellow',
    name: 'ARTEMIS Pin Kẹp Bunny Yellow',
    slug: 'clip-yellow',
    priceFrom: 299000,
    images: ['/images/clips/clip-yellow.png'],
    specs: {
      waterproof: 'IP67',
      battery: 'N/A',
      gps: false,
      simCard: false,
      weight: '12g',
    },
    description: 'Pin kẹp thỏ vàng với họa tiết cà rốt, mang năng lượng tích cực và vui tươi.',
    features: [
      'Thiết kế Bunny vui tươi',
      'Họa tiết cà rốt đáng yêu',
      'Màu vàng cam tươi sáng',
      'Kẹp chắc chắn, an toàn',
      'Chất liệu không độc hại',
      'Phong cách năng động',
    ],
  },
]

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'bunny-baby-pink',
    name: 'Bunny Baby Pink',
    basePrice: 499000,
    defaultColors: {
      band: 'pink',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['heart', 'flower', 'bunny'],
    preview: '/images/templates/bunny-baby-pink.png',
    description: 'Thỏ hồng đáng yêu với họa tiết hoa và tim, dành cho bé gái năng động',
  },
  {
    id: 'bunny-lavender',
    name: 'Bunny Lavender',
    basePrice: 499000,
    defaultColors: {
      band: 'purple',
      face: 'white',
      rim: 'purple',
    },
    recommendedAccessories: ['star', 'circle', 'bunny'],
    preview: '/images/templates/bunny-lavender.png',
    description: 'Thỏ tím pastel với họa tiết chấm tròn đầy màu sắc, dễ thương và sáng tạo',
  },
  {
    id: 'bunny-yellow',
    name: 'Bunny Yellow',
    basePrice: 499000,
    defaultColors: {
      band: 'yellow',
      face: 'white',
      rim: 'orange',
    },
    recommendedAccessories: ['carrot', 'leaf', 'bunny'],
    preview: '/images/templates/bunny-yellow.png',
    description: 'Thỏ vàng tươi với cà rốt và lá, năng lượng tích cực cho bé',
  },
  {
    id: 'bunny-mint',
    name: 'Bunny Mint',
    basePrice: 499000,
    defaultColors: {
      band: 'green',
      face: 'white',
      rim: 'green',
    },
    recommendedAccessories: ['leaf', 'flower', 'bunny'],
    preview: '/images/templates/bunny-mint.png',
    description: 'Thỏ xanh mint tươi mát với họa tiết lá và hoa, thanh lịch và dịu dàng',
  },
  {
    id: 'bunny-pink',
    name: 'Bunny Green',
    basePrice: 499000,
    defaultColors: {
      band: 'pink',
      face: 'white',
      rim: 'pink',
    },
    recommendedAccessories: ['bunny', 'heart'],
    preview: '/images/templates/bunny-pink.png',
    description: 'Thỏ hồng pastel đơn giản, nhẹ nhàng và dễ thương nhất',
  },
]

export default function HomePage() {
  const products = MOCK_PRODUCTS
  const templates = MOCK_TEMPLATES
  
  // Chọn 4 sản phẩm đại diện: 2 vòng tay, 1 dây chuyền, 1 pin kẹp
  const featuredProducts = [
    products.find(p => p.id === 'bunny-baby-pink'),
    products.find(p => p.id === 'bunny-lavender'),
    products.find(p => p.id === 'necklace-baby-pink'),
    products.find(p => p.id === 'clip-baby-pink'),
  ].filter(Boolean)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-20 lg:py-32">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <Badge className="w-fit text-xs md:text-sm">✨ Tùy biến theo cá tính</Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-pink-500">
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
              <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center p-8 md:p-12 relative overflow-hidden">
                <Image
                  src="/images/templates/bunny-baby-pink.png"
                  alt="ARTEMIS Bunny Baby Pink"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Experience Section - Emotional Connection */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              ❤️ Trải nghiệm đặc biệt
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-pink-500">
              Hiểu nỗi sợ hãi của con bạn
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Một trải nghiệm 3D cảm động giúp ba mẹ đồng cảm với cảm xúc của con 
              khi bị lạc - và hiểu tại sao vòng tay GPS là cần thiết.
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-8">
            <Card className="p-4 md:p-6 bg-gradient-to-br from-white to-pink-50 dark:from-gray-800 dark:to-gray-900 border-pink-200 dark:border-pink-900">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-3xl md:text-4xl font-bold text-red-500 mb-1">8 triệu</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    trẻ em bị lạc mỗi năm
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-3xl md:text-4xl font-bold text-orange-500 mb-1">90 phút</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    thời gian trung bình tìm lại
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-3xl md:text-4xl font-bold text-green-500 mb-1">99.9%</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    tìm thấy nhanh với GPS
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/experience">
                    <Sparkles className="h-5 w-5" />
                    Trải nghiệm 3D ngay
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  ⏱️ Chỉ mất 2 phút • 🎧 Nên dùng tai nghe để trải nghiệm tốt nhất
                </p>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Không có GPS
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Hoảng loạn không biết con ở đâu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Mất 1-2 tiếng mới tìm thấy (nếu may mắn)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Con hoảng sợ, khóc lóc, stress tâm lý</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>Nguy cơ mất mát vĩnh viễn</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Với ARTEMIS GPS
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Biết chính xác vị trí con mọi lúc</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Tìm thấy con trong vài phút</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Con bấm SOS, ba mẹ nhận cảnh báo ngay</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>An tâm, yên tâm, hạnh phúc mỗi ngày</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/40">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-pink-500">
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
                <h3 className="font-semibold text-lg text-pink-500">Định vị GPS/4G chính xác</h3>
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
                <h3 className="font-semibold text-lg text-pink-500">Chống nước IP67/IP68</h3>
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
                <h3 className="font-semibold text-lg text-pink-500">Pin bền 3-7 ngày</h3>
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
                <h3 className="font-semibold text-lg text-pink-500">SOS khẩn cấp</h3>
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
                <h3 className="font-semibold text-lg text-pink-500">Tùy biến không giới hạn</h3>
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
                <h3 className="font-semibold text-lg text-pink-500">Bảo hành 12 tháng</h3>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-pink-500">
              Sản phẩm của chúng tôi
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Chọn mẫu phù hợp rồi bắt đầu thiết kế
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {featuredProducts.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                featured={index === 0}
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-pink-500">
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
                  <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-6 relative">
                    <Image 
                      src={template.preview} 
                      alt={template.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 text-pink-500">{template.name}</h3>
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

      {/* Testimonials */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-pink-500">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-pink-500">
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

