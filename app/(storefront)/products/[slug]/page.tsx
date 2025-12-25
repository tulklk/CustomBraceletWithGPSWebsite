"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Canvas } from "@/components/Customizer/Canvas"
import { Canvas3D } from "@/components/Customizer/Canvas3D"
import { TemplatePicker } from "@/components/Customizer/TemplatePicker"
import { EngraveForm } from "@/components/Customizer/EngraveForm"
import { PriceBar } from "@/components/Customizer/PriceBar"
import { useCustomizer } from "@/store/useCustomizer"
import { useCart } from "@/store/useCart"
import { useUser } from "@/store/useUser"
import { useToast } from "@/hooks/use-toast"
import { Product, Template, Accessory } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Save, ShoppingCart, ArrowLeft, Box, Image as ImageIcon, Star, Send, Trash2, Reply, Mail, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { productsApi, BackendProduct } from "@/lib/api/products"
import { ProductCard } from "@/components/ProductCard"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, ChevronRight, Facebook, MessageCircle } from "lucide-react"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [product, setProduct] = useState<BackendProduct | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [view3D, setView3D] = useState(true) // Toggle between 2D and 3D
  const [commentText, setCommentText] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  
  // Product detail states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [previewMode, setPreviewMode] = useState<"2d" | "3d">("2d") // 2D or 3D preview mode
  
  // Mock rating data
  const [rating] = useState({ average: 4.5, count: 2, sold: 2 })
  
  // Check if product has customizer (has templates)
  // Use computed value but ensure consistent initial render
  const hasCustomizer = templates.length > 0
  
  // Mock data for reviews and comments
  const [reviews] = useState<any[]>([]) // Empty for now
  const [comments, setComments] = useState<any[]>([
    {
      id: "1",
      author: "Thành Tú",
      avatar: null,
      content: "áo này có những size nào vậy shop",
      createdAt: "2025-12-09T16:41:00Z",
      replies: [
        {
          id: "1-1",
          author: "IKA PickleBall Shop",
          avatar: null,
          isShop: true,
          content: "sản phẩm có rất nhiều size cho bạn lựa chọn nha",
          createdAt: "2025-12-09T16:52:00Z",
          replies: [
            {
              id: "1-1-1",
              author: "Thành Tú",
              avatar: null,
              content: "oke cảm ơn shop nhiều",
              createdAt: "2025-12-10T23:40:00Z",
            }
          ]
        }
      ]
    }
  ])

  const { setProduct: setCustomizerProduct, getDesign, templateId } =
    useCustomizer()
  const { addItem } = useCart()
  const { user, saveDesign } = useUser()
  const { toast } = useToast()

  // Helper function to get product type from ID
  const getProductType = (productId: string): 'bracelet' | 'necklace' | 'clip' => {
    if (productId.startsWith('bunny-')) return 'bracelet'
    if (productId.startsWith('necklace-')) return 'necklace'
    if (productId.startsWith('clip-')) return 'clip'
    return 'bracelet' // default
  }

  // Helper function to get template type from ID
  const getTemplateType = (templateId: string): 'bracelet' | 'necklace' | 'clip' => {
    if (templateId.startsWith('bunny-')) return 'bracelet'
    if (templateId.startsWith('necklace-')) return 'necklace'
    if (templateId.startsWith('clip-')) return 'clip'
    return 'bracelet' // default
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foundProduct, templatesRes, accessoriesRes] = await Promise.all([
          productsApi.getBySlug(slug as string),
          fetch("/api/templates"),
          fetch("/api/accessories"),
        ])

        const templatesData = await templatesRes.json()
        const accessoriesData = await accessoriesRes.json()

        if (!foundProduct) {
          router.push("/products")
          return
        }

        setProduct(foundProduct)
        
        // Filter templates based on product type (if needed for customizer)
        const productType = getProductType(foundProduct.id)
        const filteredTemplates = templatesData.filter((template: Template) => {
          const templateType = getTemplateType(template.id)
          return templateType === productType
        })

        setTemplates(filteredTemplates)
        setAccessories(accessoriesData)
        setCustomizerProduct(foundProduct.id)
        
        // Set default color and size from variants if available
        if (foundProduct.variants && foundProduct.variants.length > 0) {
          const firstVariant = foundProduct.variants[0]
          if (firstVariant.color) setSelectedColor(firstVariant.color)
          if (firstVariant.size) setSelectedSize(firstVariant.size)
        }
        
        // Fetch similar products (same category or random products)
        try {
          const allProducts = await productsApi.getAll()
          // Get products from same category or random 4 products
          const similar = allProducts
            .filter((p) => p.id !== foundProduct.id)
            .slice(0, 4)
          setSimilarProducts(similar)
        } catch (err) {
          console.error("Error fetching similar products:", err)
        }

        // Auto-select first template if none selected
        if (!templateId && filteredTemplates.length > 0) {
          // Will be set by user clicking
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, router, setCustomizerProduct, templateId])

  const handleAddToCart = () => {
    if (!product) return
    
    // For regular products (not customizer)
    if (!product.hasVariants) {
      toast({
        title: "Đã thêm vào giỏ hàng!",
        description: `${product.name} x${quantity}`,
      })
      return
    }
    
    // For customizer products
    if (!templateId) {
      toast({
        title: "Vui lòng chọn template",
        description: "Hãy chọn một mẫu thiết kế trước khi thêm vào giỏ",
        variant: "destructive",
      })
      return
    }

    const design = getDesign()
    addItem(design)
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: "Xem giỏ hàng để thanh toán",
    })
  }
  
  const handleBuyNow = () => {
    handleAddToCart()
    router.push("/cart")
  }
  
  const getProductImages = () => {
    if (!product) return []
    return product.imageUrls && product.imageUrls.length > 0 
      ? product.imageUrls 
      : product.images && product.images.length > 0 
      ? product.images 
      : []
  }
  
  const getAvailableColors = () => {
    if (!product?.variants) return []
    const colors = new Set<string>()
    product.variants.forEach((v: any) => {
      if (v.color) colors.add(v.color)
    })
    return Array.from(colors)
  }
  
  const getAvailableSizes = () => {
    if (!product?.variants) return ["S", "M", "L"] // Default sizes
    const sizes = new Set<string>()
    product.variants.forEach((v: any) => {
      if (v.size) sizes.add(v.size)
    })
    return sizes.size > 0 ? Array.from(sizes) : ["S", "M", "L"]
  }

  const handleSaveDesign = () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Đăng nhập để lưu thiết kế",
        variant: "destructive",
      })
      return
    }

    if (!templateId) {
      toast({
        title: "Vui lòng chọn template",
        variant: "destructive",
      })
      return
    }

    const design = getDesign()
    saveDesign(design)
    toast({
      title: "Đã lưu thiết kế!",
      description: "Xem trong 'Thiết kế của tôi'",
    })
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-12">
        <div className="text-center">Không tìm thấy sản phẩm</div>
      </div>
    )
  }

  // Compute values after product is loaded
  const images = getProductImages()
  const colors = getAvailableColors()
  const sizes = getAvailableSizes()
  const discount = product.originalPrice 
    ? product.originalPrice - product.price 
    : 0

  return (
    <div className="container py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-primary">Sản phẩm</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary font-medium">{product.name}</span>
      </div>

      {/* Product Detail Layout */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Left: Image Gallery or 2D/3D Preview */}
        <div className="space-y-4">
          {/* Toggle Header - Show for all products if has images */}
          {images.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary text-primary-foreground">
                  {previewMode === "2d" ? "2D Preview" : "3D Preview"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {previewMode === "2d" ? "Xem thiết kế 2D" : "Trải nghiệm 3D tương tác"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === "2d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("2d")}
                  className={previewMode === "2d" ? "bg-primary" : ""}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  2D
                </Button>
                {hasCustomizer && (
                  <Button
                    variant={previewMode === "3d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("3d")}
                    className={previewMode === "3d" ? "bg-primary" : ""}
                  >
                    <Box className="h-4 w-4 mr-2" />
                    3D
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Preview Content */}
          <div className="relative">
            {previewMode === "2d" ? (
              /* 2D Preview: Show images from Cloudinary (imageUrls) */
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-transparent rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <Image
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedImageIndex((prev) => 
                          prev > 0 ? prev - 1 : images.length - 1
                        )}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedImageIndex((prev) => 
                          prev < images.length - 1 ? prev + 1 : 0
                        )}
                      >
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </Button>
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {selectedImageIndex + 1}/{images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImageIndex(index)
                          setPreviewMode("2d")
                        }}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index 
                            ? "border-primary" 
                            : "border-transparent hover:border-muted-foreground"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* 3D Preview: Show Canvas3D for customizer products */
              hasCustomizer ? (
                <Canvas3D accessories={accessories} />
              ) : (
                /* Fallback to 2D if no customizer */
                <div className="relative aspect-square bg-transparent rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <Image
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.floor(rating.average)
                      ? "fill-yellow-400 text-yellow-400"
                      : star <= rating.average
                      ? "fill-yellow-200 text-yellow-200"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({rating.count} đánh giá)
            </span>
            <span className="text-sm text-muted-foreground">
              Đã bán {rating.sold}
            </span>
          </div>
          
          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium">Màu sắc:</span>
                <span className="text-sm text-muted-foreground">
                  {selectedColor || colors[0]}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                    className={selectedColor === color ? "bg-primary" : ""}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Price */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Giá khuyến mãi:</div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm text-green-600">
                      Tiết kiệm: {formatCurrency(discount)}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Additional Benefits */}
          <div>
            <div className="text-sm font-medium mb-2">Ưu đãi thêm:</div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span>✓</span>
              <span>Freeship khi thanh toán trước đơn hàng</span>
            </div>
          </div>
          
          {/* Brand & Status */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.brand && (
              <div>
                <span className="text-muted-foreground">Thương hiệu: </span>
                <span className="font-medium">{product.brand}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Tình trạng: </span>
              <span className={`font-medium ${
                product.stockQuantity > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {product.stockQuantity > 0 ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>
          </div>
          
          {/* Quantity */}
          <div>
            <div className="text-sm font-medium mb-2">Số lượng:</div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1
                  setQuantity(Math.max(1, Math.min(val, product.stockQuantity)))
                }}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity((prev) => 
                  Math.min(product.stockQuantity, prev + 1)
                )}
                disabled={quantity >= product.stockQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={handleBuyNow}
              className="w-full bg-white border-2 border-primary text-primary hover:bg-pink-50 hover:border-primary/90"
              size="lg"
            >
              MUA NGAY
            </Button>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              THÊM VÀO GIỎ HÀNG
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.open("https://zalo.me/your-zalo-id", "_blank")
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Tư vấn qua Zalo
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.open("https://facebook.com/your-page", "_blank")
              }}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Tư vấn qua Facebook
            </Button>
          </div>
        </div>
      </div>

      {/* Product Images Gallery */}
      {product.images && product.images.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {product.images.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-border">
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="details">CHI TIẾT SẢN PHẨM</TabsTrigger>
          <TabsTrigger value="reviews">ĐÁNH GIÁ ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">1. Giới thiệu {product.name}</h2>
            <div className="text-muted-foreground whitespace-pre-line">
              {product.description || "Không có mô tả chi tiết."}
            </div>
          </div>
          
          {product.images && product.images.length > 0 && (
            <div className="flex justify-center my-8">
              <div className="relative w-full max-w-2xl aspect-square">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            </div>
          )}
          
          {/* Only show specs/features if product has them (for customizer products) */}
          {(product as any).specs || (product as any).features ? (
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {(product as any).specs && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-primary">Thông số kỹ thuật</h2>
                  <div className="space-y-3">
                    {(product as any).specs.waterproof && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Chống nước:</span>
                        <Badge>{(product as any).specs.waterproof}</Badge>
                      </div>
                    )}
                    {(product as any).specs.battery && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Pin:</span>
                        <span>{(product as any).specs.battery}</span>
                      </div>
                    )}
                    {(product as any).specs.gps !== undefined && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">GPS:</span>
                        <span>{(product as any).specs.gps ? "Có" : "Không"}</span>
                      </div>
                    )}
                    {(product as any).specs.simCard !== undefined && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">SIM:</span>
                        <span>{(product as any).specs.simCard ? "Có" : "Không"}</span>
                      </div>
                    )}
                    {(product as any).specs.weight && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Trọng lượng:</span>
                        <span>{(product as any).specs.weight}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(product as any).features && (product as any).features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Tính năng</h2>
                  <ul className="space-y-2">
                    {(product as any).features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // For regular products without specs, show additional product info
            <div className="mt-8 space-y-4">
              {product.brand && (
                <div>
                  <span className="font-medium">Thương hiệu: </span>
                  <span>{product.brand}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Tình trạng: </span>
                <span className={product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>
                  {product.stockQuantity > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>
              {product.stockQuantity > 0 && (
                <div>
                  <span className="font-medium">Số lượng còn lại: </span>
                  <span>{product.stockQuantity}</span>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">0.0</div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-6 w-6 text-muted fill-muted" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mb-1">ĐÁNH GIÁ TRUNG BÌNH</div>
              <div className="text-sm text-muted-foreground">{reviews.length} đánh giá</div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-8 text-sm">{rating}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {percentage.toFixed(0)}% | {count} đánh giá
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Rate Button */}
            <div className="flex items-center justify-center">
              <Button className="bg-primary hover:bg-primary/90">
                ĐÁNH GIÁ NGAY
              </Button>
            </div>
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Chưa có đánh giá nào cho sản phẩm này.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">SẢN PHẨM TƯƠNG TỰ</h2>
            <Button variant="outline" asChild>
              <Link href="/products">
                Xem thêm <ChevronUp className="h-4 w-4 ml-2 rotate-[-90deg]" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Bình luận</h2>
        
        {/* Comment Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Textarea
              placeholder={user ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user}
              className="min-h-[100px] mb-4"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Vui lòng đăng nhập",
                      description: "Đăng nhập để bình luận",
                      variant: "destructive",
                    })
                    return
                  }
                  if (!commentText.trim()) return
                  
                  const newComment = {
                    id: Date.now().toString(),
                    author: user.name || user.email,
                    avatar: user.avatar,
                    content: commentText,
                    createdAt: new Date().toISOString(),
                    replies: [],
                  }
                  setComments([...comments, newComment])
                  setCommentText("")
                  toast({
                    title: "Đã gửi bình luận",
                    description: "Bình luận của bạn đã được đăng",
                  })
                }}
                disabled={!commentText.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi bình luận
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              onReply={(id) => setReplyTo(id)}
              onDelete={(id) => {
                setComments(comments.filter((c) => c.id !== id))
              }}
            />
          ))}
        </div>
      </div>

      {/* Newsletter Subscription */}
      <Card className="mt-16 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Đăng ký nhận thông tin</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Nhận các chương trình khuyến mãi, thông báo sản phẩm mới và các ưu đãi khác dành riêng cho bạn.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Nhập Email của bạn"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                if (!newsletterEmail.trim()) {
                  toast({
                    title: "Vui lòng nhập email",
                    variant: "destructive",
                  })
                  return
                }
                toast({
                  title: "Đăng ký thành công!",
                  description: "Cảm ơn bạn đã đăng ký nhận thông tin",
                })
                setNewsletterEmail("")
              }}
              className="bg-primary hover:bg-primary/90"
            >
              ĐĂNG KÝ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Comment Item Component
function CommentItem({
  comment,
  user,
  onReply,
  onDelete,
}: {
  comment: any
  user: any
  onReply: (id: string) => void
  onDelete: (id: string) => void
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    
    return `lúc ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${day} tháng ${month}, ${year}`
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {comment.avatar ? (
            <Image src={comment.avatar} alt={comment.author} width={40} height={40} className="rounded-full" />
          ) : (
            <span className="text-primary font-semibold">
              {comment.author.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{comment.author}</span>
            {comment.isShop && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                Shop
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="h-8 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Trả lời
            </Button>
            {user && (user.email === comment.author || user.role === 1) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(comment.id)}
                className="h-8 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Xóa
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-14 space-y-4 border-l-2 border-muted pl-4">
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              user={user}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

