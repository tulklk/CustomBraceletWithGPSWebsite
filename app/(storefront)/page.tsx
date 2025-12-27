"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BraceletImage } from "@/components/BraceletImage"
import { AnimatedText } from "@/components/AnimatedText"
import { motion } from "framer-motion"
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/ScrollAnimation"
import {
  Shield,
  Droplet,
  Battery,
  MapPin,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Product, Template } from "@/lib/types"

// Mock data - same as API routes
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'bunny-baby-pink',
    name: 'ARTEMIS Bunny Baby Pink',
    slug: 'bunny-baby-pink',
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    priceFrom: 550000,
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
    basePrice: 550000,
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
    basePrice: 550000,
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
    basePrice: 550000,
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
    basePrice: 550000,
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
    basePrice: 550000,
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

  // Carousel ref and state
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const isScrollingRef = useRef(false)

  // Duplicate products for infinite loop
  const duplicatedProducts = [...featuredProducts, ...featuredProducts, ...featuredProducts]

  // Check scroll position
  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Reset scroll position seamlessly for infinite loop
  const resetScrollPosition = () => {
    if (carouselRef.current && !isScrollingRef.current) {
      const { scrollLeft, scrollWidth } = carouselRef.current
      const singleSetWidth = scrollWidth / 3 // We have 3 sets of products
      
      // If we're in the third set (near the end), reset to first set seamlessly
      if (scrollLeft >= singleSetWidth * 2) {
        isScrollingRef.current = true
        carouselRef.current.scrollLeft = scrollLeft - singleSetWidth
        isScrollingRef.current = false
      }
      // If we're before the first set (scrolled left), reset to last set
      else if (scrollLeft < singleSetWidth) {
        isScrollingRef.current = true
        carouselRef.current.scrollLeft = scrollLeft + singleSetWidth
        isScrollingRef.current = false
      }
    }
  }

  // Scroll functions
  const scrollLeft = () => {
    if (carouselRef.current && !isScrollingRef.current) {
      const cardWidth = carouselRef.current.querySelector('.product-card')?.clientWidth || 300
      const gap = 24 // gap-6 = 24px
      carouselRef.current.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      })
      setTimeout(() => {
        checkScrollButtons()
        resetScrollPosition()
      }, 300)
    }
  }

  const scrollRight = () => {
    if (carouselRef.current && !isScrollingRef.current) {
      const cardWidth = carouselRef.current.querySelector('.product-card')?.clientWidth || 300
      const gap = 24 // gap-6 = 24px
      carouselRef.current.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      })
      setTimeout(() => {
        checkScrollButtons()
        resetScrollPosition()
      }, 300)
    }
  }

  // Initialize scroll position to middle set for seamless infinite loop
  useEffect(() => {
    if (carouselRef.current && featuredProducts.length > 0) {
      // Wait for layout to calculate
      setTimeout(() => {
        if (carouselRef.current) {
          const cardWidth = carouselRef.current.querySelector('.product-card')?.clientWidth || 300
          const gap = 24
          const singleSetWidth = (cardWidth + gap) * featuredProducts.length
          // Start at the middle set (second set)
          carouselRef.current.scrollLeft = singleSetWidth
        }
        checkScrollButtons()
      }, 100)
    }
    
    const handleResize = () => {
      checkScrollButtons()
      resetScrollPosition()
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [featuredProducts])

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) {
      // Clear interval when paused
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
      return
    }

    // Start auto-scroll
    autoScrollIntervalRef.current = setInterval(() => {
      if (carouselRef.current && !isScrollingRef.current) {
        const cardWidth = carouselRef.current.querySelector('.product-card')?.clientWidth || 300
        const gap = 24
        carouselRef.current.scrollBy({
          left: cardWidth + gap,
          behavior: 'smooth'
        })
        setTimeout(() => {
          checkScrollButtons()
          resetScrollPosition()
        }, 300)
      }
    }, 3000) // Scroll every 3 seconds
    
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
    }
  }, [isPaused, featuredProducts])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-8 sm:py-12 md:py-20 lg:py-32">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
              <ScrollAnimation direction="fade" delay={0.1}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge className="w-fit text-xs sm:text-sm">✨ Tùy biến theo cá tính</Badge>
                </motion.div>
              </ScrollAnimation>
              <AnimatedText
                text="An tâm theo dõi con yêu mọi lúc mọi nơi"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-pink-500"
              />
              <ScrollAnimation direction="up" delay={0.2}>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  Thiết kế vòng tay GPS độc nhất cho bé với hàng trăm tùy chọn màu sắc,
                  phụ kiện và khắc tên. Công nghệ định vị hiện đại, an toàn tuyệt đối.
                </p>
              </ScrollAnimation>
              <ScrollAnimation direction="up" delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Button asChild size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                      <Link href="/products">Bắt đầu mua hàng</Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                      <Link href="/guides">Tìm hiểu thêm</Link>
                    </Button>
                  </motion.div>
                </div>
              </ScrollAnimation>
            </div>
            <ScrollAnimation direction="right" delay={0.2}>
              <div className="relative order-1 lg:order-2 mb-4 sm:mb-0">
                <motion.div 
                  className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl sm:rounded-3xl flex items-center justify-center p-6 sm:p-8 md:p-12 relative overflow-hidden max-w-md mx-auto lg:max-w-none"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/templates/bunny-baby-pink.png"
                    alt="ARTEMIS Bunny Baby Pink"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* 3D Experience Section - Emotional Connection */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4 sm:px-6">
          <ScrollAnimation direction="fade">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs sm:text-sm">
                ❤️ Trải nghiệm đặc biệt
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-pink-500 px-2">
                Hiểu nỗi sợ hãi của con bạn
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
                Một trải nghiệm 3D cảm động giúp ba mẹ đồng cảm với cảm xúc của con 
                khi bị lạc - và hiểu tại sao vòng tay GPS là cần thiết.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation direction="up" delay={0.2}>
            <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white to-pink-50 dark:from-gray-800 dark:to-gray-900 border-pink-200 dark:border-pink-900">
                  <StaggerContainer>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <StaggerItem>
                        <motion.div 
                          className="text-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                          whileHover={{ scale: 1.05, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500 mb-1">8 triệu</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            trẻ em bị lạc mỗi năm
                          </p>
                        </motion.div>
                      </StaggerItem>
                      <StaggerItem>
                        <motion.div 
                          className="text-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                          whileHover={{ scale: 1.05, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500 mb-1">90 phút</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            thời gian trung bình tìm lại
                          </p>
                        </motion.div>
                      </StaggerItem>
                      <StaggerItem>
                        <motion.div 
                          className="text-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                          whileHover={{ scale: 1.05, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-500 mb-1">99.9%</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            tìm thấy nhanh với GPS
                          </p>
                        </motion.div>
                      </StaggerItem>
                    </div>
                  </StaggerContainer>

                  <div className="text-center">
                    <Button asChild size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base">
                      <Link href="/experience">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                        Trải nghiệm 3D ngay
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 sm:mt-3 px-2">
                      ⏱️ Chỉ mất 2 phút • 🎧 Nên dùng tai nghe để trải nghiệm tốt nhất
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </ScrollAnimation>

          <StaggerContainer className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 sm:p-5 md:p-6">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    Không có GPS
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      <span>Hoảng loạn không biết con ở đâu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      <span>Mất 1-2 tiếng mới tìm thấy (nếu may mắn)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      <span>Con hoảng sợ, khóc lóc, stress tâm lý</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                      <span>Nguy cơ mất mát vĩnh viễn</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    Với ARTEMIS GPS
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>Biết chính xác vị trí con mọi lúc</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>Tìm thấy con trong vài phút</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>Con bấm SOS, ba mẹ nhận cảnh báo ngay</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      <span>An tâm, yên tâm, hạnh phúc mỗi ngày</span>
                    </li>
                  </ul>
                </Card>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/40">
        <div className="container px-4 sm:px-6">
          <ScrollAnimation direction="fade">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-primary px-2">
                Tại sao chọn ARTEMIS?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
                An toàn - Thời trang - Công nghệ
              </p>
            </div>
          </ScrollAnimation>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
                    <motion.div 
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-base sm:text-lg">Định vị GPS chính xác</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Theo dõi vị trí thời gian thực, lịch sử di chuyển, vùng an toàn
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
                    <motion.div 
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Droplet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-base sm:text-lg">Chống nước IP67/IP68</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Thoải mái rửa tay, đi mưa, thậm chí bơi lội (IP68)
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
                    <motion.div 
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Battery className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-base sm:text-lg">Pin bền 1 năm</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Không lo hết pin giữa chừng.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
                    <motion.div 
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-base sm:text-lg">Tùy biến không giới hạn</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Hàng trăm tùy chọn màu, phụ kiện, khắc tên theo sở thích
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
                    <motion.div 
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-base sm:text-lg">Bảo hành 6 tháng</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Hỗ trợ kỹ thuật trọn đời, đổi trả miễn phí trong 7 ngày
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Products */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container px-4 sm:px-6">
          <ScrollAnimation direction="fade">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-pink-500 px-2">
                Sản phẩm của chúng tôi
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
                Chọn mẫu phù hợp rồi bắt đầu thiết kế
              </p>
            </div>
          </ScrollAnimation>

          <div className="relative max-w-7xl mx-auto">
            {/* Left Arrow */}
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 shadow-lg hover:bg-white dark:hover:bg-gray-900 h-10 w-10 rounded-full hidden sm:flex"
                onClick={scrollLeft}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 sm:px-0"
              onScroll={() => {
                checkScrollButtons()
                resetScrollPosition()
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {duplicatedProducts.map((product: any, index: number) => (
                <div
                  key={`${product.id}-${index}`}
                  className="product-card flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
                >
                  <ProductCard
                    product={product}
                    featured={index % featuredProducts.length === 0}
                  />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 shadow-lg hover:bg-white dark:hover:bg-gray-900 h-10 w-10 rounded-full hidden sm:flex"
                onClick={scrollRight}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>

          <ScrollAnimation direction="fade" delay={0.3}>
            <div className="text-center mt-8 sm:mt-10 md:mt-12">
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                <Link href="/products">
                  Xem tất cả {products.length} sản phẩm
                </Link>
              </Button>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/40">
        <div className="container px-4 sm:px-6">
          <ScrollAnimation direction="fade">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-pink-500 px-2">
                Mẫu thiết kế nổi bật
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
                Cảm hứng từ cộng đồng ARTEMIS
              </p>
            </div>
          </ScrollAnimation>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {templates.slice(0, 4).map((template: any) => (
              <StaggerItem key={template.id}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href={`/products`}>
                      <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4 sm:p-6 relative">
                        <Image 
                          src={template.preview} 
                          alt={template.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                          className="object-contain p-2 sm:p-4"
                        />
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold mb-1 text-pink-500 text-sm sm:text-base">{template.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollAnimation direction="fade" delay={0.3}>
            <div className="text-center mt-6 sm:mt-8">
              <Button asChild size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                <Link href="/products">Xem tất cả mẫu</Link>
              </Button>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container px-4 sm:px-6">
          <ScrollAnimation direction="fade">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-pink-500 px-2">
                Phụ huynh nói gì về chúng tôi
              </h2>
            </div>
          </ScrollAnimation>

          <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
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
              <StaggerItem key={index}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-5 md:p-6">
                      <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container text-center px-4 sm:px-6">
          <ScrollAnimation direction="fade">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-pink-500 px-2">
              Sẵn sàng bảo vệ con yêu?
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 opacity-90 px-2">
              Bắt đầu thiết kế vòng tay độc nhất ngay hôm nay
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto text-sm sm:text-base">
                <Link href="/products">Khám phá ngay</Link>
              </Button>
            </motion.div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}

