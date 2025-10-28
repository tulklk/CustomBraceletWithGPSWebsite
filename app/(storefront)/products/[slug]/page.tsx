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
import { Save, ShoppingCart, ArrowLeft, Box, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(true)
  const [view3D, setView3D] = useState(true) // Toggle between 2D and 3D

  const { setProduct: setCustomizerProduct, getDesign, templateId } =
    useCustomizer()
  const { addItem } = useCart()
  const { user, saveDesign } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, templatesRes, accessoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/templates"),
          fetch("/api/accessories"),
        ])

        const products = await productsRes.json()
        const templatesData = await templatesRes.json()
        const accessoriesData = await accessoriesRes.json()

        const foundProduct = products.find((p: Product) => p.slug === slug)

        if (!foundProduct) {
          router.push("/products")
          return
        }

        setProduct(foundProduct)
        setTemplates(templatesData)
        setAccessories(accessoriesData)
        setCustomizerProduct(foundProduct.id)

        // Auto-select first template if none selected
        if (!templateId && templatesData.length > 0) {
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

  return (
    <div className="container py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/products">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
        <p className="text-muted-foreground text-lg">{product.description}</p>
      </div>

      <Tabs defaultValue="design" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="design">Thiết kế</TabsTrigger>
          <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Canvas Preview */}
            <div className="space-y-4">
              {/* 2D/3D Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={view3D ? "default" : "outline"}>
                    {view3D ? "3D" : "2D"} Preview
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {view3D ? "Trải nghiệm 3D tương tác" : "Xem thiết kế 2D"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={!view3D ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView3D(false)}
                    className="gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    2D
                  </Button>
                  <Button
                    variant={view3D ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView3D(true)}
                    className="gap-2"
                  >
                    <Box className="h-4 w-4" />
                    3D
                  </Button>
                </div>
              </div>

              {/* Canvas Display */}
              {view3D ? (
                <Canvas3D accessories={accessories} />
              ) : (
                <Canvas accessories={accessories} />
              )}
              
              <PriceBar accessories={accessories} />
              
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thêm vào giỏ
                </Button>
                <Button
                  onClick={handleSaveDesign}
                  variant="outline"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu
                </Button>
              </div>
            </div>

            {/* Customizer Options */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Chọn Template</h2>
                <TemplatePicker templates={templates} />
              </div>

              <Separator />

              <div>
                <h2 className="text-2xl font-semibold mb-4">Khắc tên</h2>
                <EngraveForm />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Thông số kỹ thuật</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Chống nước:</span>
                  <Badge>{product.specs.waterproof}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Pin:</span>
                  <span>{product.specs.battery}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">GPS:</span>
                  <span>{product.specs.gps ? "Có" : "Không"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">SIM:</span>
                  <span>{product.specs.simCard ? "Có" : "Không"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Trọng lượng:</span>
                  <span>{product.specs.weight}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Tính năng</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

