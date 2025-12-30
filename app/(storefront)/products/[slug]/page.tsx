"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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
import { Product, Template, Accessory, CustomDesign } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Save, ShoppingCart, ArrowLeft, Box, Image as ImageIcon, Star, Send, Trash2, Reply, Mail, ChevronUp, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { productsApi, BackendProduct } from "@/lib/api/products"
import { ProductCard } from "@/components/ProductCard"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, ChevronRight, Facebook, MessageCircle, X, Upload, Heart } from "lucide-react"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { wishlistApi } from "@/lib/api/wishlist"
import { productCommentsApi, ProductComment } from "@/lib/api/productComments"
import { productReviewsApi, ProductReview } from "@/lib/api/productReviews"

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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewFullName, setReviewFullName] = useState("")
  const [reviewPhoneNumber, setReviewPhoneNumber] = useState("")
  const [reviewEmail, setReviewEmail] = useState("")
  const [reviewSendPhoto, setReviewSendPhoto] = useState(false)
  const [reviewSaveInfo, setReviewSaveInfo] = useState(false)
  const [reviewPhotoUrls, setReviewPhotoUrls] = useState<string[]>([])
  const [reviewPhotoFiles, setReviewPhotoFiles] = useState<File[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const reviewPhotoInputRef = useRef<HTMLInputElement>(null)
  
  // Product detail states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [previewMode, setPreviewMode] = useState<"2d" | "3d">("2d") // 2D or 3D preview mode
  
  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  
  // Check if product has customizer (has templates)
  // Use computed value but ensure consistent initial render
  const hasCustomizer = templates.length > 0
  const [comments, setComments] = useState<ProductComment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const { setProduct: setCustomizerProduct, getDesign, templateId } =
    useCustomizer()
  const { addItem, addItemByProductId } = useCart()
  const { user, saveDesign, makeAuthenticatedRequest } = useUser()
  const { toast } = useToast()
  
  // Wishlist state - default to false, only set to true when explicitly confirmed
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [checkingWishlist, setCheckingWishlist] = useState(false)
  
  // Sold quantity state
  const [soldQuantity, setSoldQuantity] = useState<number>(0)

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
        // Check if slug is a GUID (ID) or a slug string
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug as string)
        
        const [foundProduct, templatesRes, accessoriesRes] = await Promise.all([
          isGuid ? productsApi.getById(slug as string) : productsApi.getBySlug(slug as string),
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
        
        // Fetch sold quantity for this product
        try {
          const soldQuantityRes = await fetch(`/api/products/${foundProduct.id}/sold-quantity`)
          if (soldQuantityRes.ok) {
            const data = await soldQuantityRes.json()
            setSoldQuantity(data.soldQuantity || 0)
          }
        } catch (err) {
          console.error("Error fetching sold quantity:", err)
          setSoldQuantity(0)
        }
        
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
        
        // Fetch similar products (same category)
        try {
          const allProducts = await productsApi.getAll()
          
          // Fetch backend products to get categoryId
          const { API_BASE_URL } = await import("@/lib/constants")
          const backendResponse = await fetch(`${API_BASE_URL}/api/Products`, {
            method: "GET",
            headers: { "accept": "*/*" },
          })
          const allBackendProducts: BackendProduct[] = await backendResponse.json()
          
          // Get current product's categoryId
          const currentProductCategoryId = foundProduct.categoryId
          
          // Filter products from the same category
          let similar: Product[] = []
          
          if (currentProductCategoryId) {
            // Get product IDs that belong to the same category
            const sameCategoryProductIds = allBackendProducts
              .filter((bp) => bp.categoryId === currentProductCategoryId && bp.id !== foundProduct.id && bp.isActive)
              .map((bp) => bp.id)
            
            // Get products that match those IDs
            similar = allProducts
              .filter((p) => sameCategoryProductIds.includes(p.id))
              .slice(0, 4)
          }
          
          // If not enough products from same category, fill with other products
          if (similar.length < 4) {
            const remaining = allProducts
              .filter((p) => p.id !== foundProduct.id && !similar.some((s) => s.id === p.id))
              .slice(0, 4 - similar.length)
            similar = [...similar, ...remaining]
          }
          
          setSimilarProducts(similar)
        } catch (err) {
          console.error("Error fetching similar products:", err)
          // Fallback: just get any 4 products excluding current
          try {
            const allProducts = await productsApi.getAll()
            const similar = allProducts
              .filter((p) => p.id !== foundProduct.id)
              .slice(0, 4)
            setSimilarProducts(similar)
          } catch (fallbackErr) {
            console.error("Error in fallback similar products:", fallbackErr)
          }
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

  // Check if product is in wishlist
  useEffect(() => {
    // Reset to false when product or user changes
    setIsInWishlist(false)
    
    const checkWishlist = async () => {
      if (!user?.accessToken || !product?.id) {
        return
      }

      setCheckingWishlist(true)
      try {
        // Try using check endpoint first
        let inWishlist = false
        try {
          inWishlist = await makeAuthenticatedRequest(async (token) => {
            return await wishlistApi.check(token, product.id)
          })
          console.log("Wishlist check result for product", product.id, ":", inWishlist, "type:", typeof inWishlist)
        } catch (checkError) {
          console.warn("Check endpoint failed, trying to fetch all wishlist items:", checkError)
          // Fallback: fetch all wishlist items and check if productId exists
          const allItems = await makeAuthenticatedRequest(async (token) => {
            return await wishlistApi.getAll(token)
          })
          inWishlist = allItems.some(item => item.productId === product.id)
          console.log("Fallback check - product in wishlist:", inWishlist)
        }
        
        // Set based on the result
        setIsInWishlist(Boolean(inWishlist))
      } catch (error) {
        console.error("Error checking wishlist:", error)
        // On error, assume not in wishlist
        setIsInWishlist(false)
      } finally {
        setCheckingWishlist(false)
      }
    }

    // Only check if we have both user and product
    if (user?.accessToken && product?.id) {
      checkWishlist()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken, product?.id])

  // Helper function to flatten nested comments structure
  const flattenComments = useCallback((comments: ProductComment[]): ProductComment[] => {
    const flattened: ProductComment[] = []
    
    const traverse = (items: ProductComment[]) => {
      for (const item of items) {
        flattened.push(item)
        if (item.replies && item.replies.length > 0) {
          traverse(item.replies)
        }
      }
    }
    
    traverse(comments)
    return flattened
  }, [])

  // Helper function to recursively build comment tree
  const buildCommentTree = useCallback((allComments: ProductComment[], parentId: string | null): ProductComment[] => {
    return allComments
      .filter(c => {
        if (parentId === null) {
          return !c.parentCommentId || c.parentCommentId === null || c.parentCommentId === "" || c.parentCommentId === undefined
        }
        return c.parentCommentId === parentId
      })
      .map(comment => ({
        ...comment,
        replies: buildCommentTree(allComments, comment.id),
      }))
  }, [])

  // Helper function to organize comments into tree structure
  const organizeComments = useCallback((comments: ProductComment[]): ProductComment[] => {
    // First, flatten if comments are already nested
    const allComments = flattenComments(comments)
    
    // Build tree recursively starting from root (parentId = null)
    return buildCommentTree(allComments, null)
  }, [flattenComments, buildCommentTree])

  // Helper function to refresh comments (force fresh fetch)
  const refreshComments = useCallback(async () => {
    if (!product?.slug) return
    
    try {
      // Use fresh fetch to bypass cache and get latest data
      const fetchedComments = await productCommentsApi.getBySlugFresh(product.slug)
      console.log("Fetched comments (raw):", fetchedComments)
      
      const organizedComments = organizeComments(fetchedComments)
      console.log("Organized comments:", organizedComments)
      
      setComments(organizedComments)
    } catch (error) {
      console.error("Error refreshing comments:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải lại bình luận",
        variant: "destructive",
      })
    }
  }, [product?.slug, organizeComments, toast])

  // Fetch comments when product is loaded
  useEffect(() => {
    const fetchComments = async () => {
      if (!product?.slug) return

      setLoadingComments(true)
      try {
        const fetchedComments = await productCommentsApi.getBySlug(product.slug)
        const organizedComments = organizeComments(fetchedComments)
        setComments(organizedComments)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải bình luận",
          variant: "destructive",
        })
      } finally {
        setLoadingComments(false)
      }
    }

    fetchComments()
  }, [product?.slug, toast, organizeComments])

  // Fetch reviews when product loads
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id && !product?.slug) return

      setLoadingReviews(true)
      try {
        const productIdOrSlug = product.id || product.slug
        const fetchedReviews = await productReviewsApi.getByProductIdOrSlug(productIdOrSlug)
        setReviews(fetchedReviews)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải đánh giá",
          variant: "destructive",
        })
      } finally {
        setLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [product?.id, product?.slug, toast])

  // Refresh reviews after submitting
  const refreshReviews = useCallback(async () => {
    if (!product?.id && !product?.slug) return
    
    try {
      const productIdOrSlug = product.id || product.slug
      const fetchedReviews = await productReviewsApi.getByProductIdOrSlugFresh(productIdOrSlug)
      setReviews(fetchedReviews)
    } catch (error) {
      console.error("Error refreshing reviews:", error)
    }
  }, [product?.id, product?.slug])

  const handleToggleWishlist = async () => {
    if (!user?.accessToken) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Đăng nhập để thêm sản phẩm vào danh sách yêu thích",
        variant: "destructive",
      })
      return
    }

    if (!product) return

    try {
      if (isInWishlist) {
        await makeAuthenticatedRequest(async (token) => {
          await wishlistApi.remove(token, product.id)
        })
        setIsInWishlist(false)
        toast({
          title: "Đã xóa khỏi danh sách yêu thích",
        })
      } else {
        await makeAuthenticatedRequest(async (token) => {
          await wishlistApi.add(token, product.id)
        })
        setIsInWishlist(true)
        toast({
          title: "Đã thêm sản phẩm vào danh sách yêu thích",
        })
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật danh sách yêu thích",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    // For regular products (not customizer) - use API
    if (!hasCustomizer) {
      try {
        await addItemByProductId(product.id, quantity)
        toast({
          title: "Đã thêm vào giỏ hàng!",
          description: `${product.name} x${quantity}`,
        })
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể thêm sản phẩm vào giỏ hàng",
          variant: "destructive",
        })
      }
      return
    }
    
    // For customizer products - use local storage with design
    // If no template selected, use first template or create default design
    let design
    if (!templateId && templates.length > 0) {
      // Use first template as default
      const firstTemplate = templates[0]
      const defaultDesign: CustomDesign = {
        productId: product.id,
        templateId: firstTemplate.id,
        colors: {
          band: firstTemplate.defaultColors?.band || '#FFFFFF',
          face: firstTemplate.defaultColors?.face || '#FFFFFF',
          rim: firstTemplate.defaultColors?.rim || '#FFFFFF',
        },
        accessories: [],
        unitPrice: firstTemplate.basePrice || product.price,
      }
      design = defaultDesign
    } else if (templateId) {
      design = getDesign()
    } else {
      // No templates available, use product directly via API
      try {
        await addItemByProductId(product.id, quantity)
        toast({
          title: "Đã thêm vào giỏ hàng!",
          description: `${product.name} x${quantity}`,
        })
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể thêm sản phẩm vào giỏ hàng",
          variant: "destructive",
        })
      }
      return
    }

    await addItem(design)
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: "Xem giỏ hàng để thanh toán",
    })
  }
  
  const handleBuyNow = async () => {
    if (!product) return
    
    try {
      // For regular products (not customizer) - use API
      if (!hasCustomizer) {
        await addItemByProductId(product.id, quantity)
        toast({
          title: "Đã thêm vào giỏ hàng!",
          description: `${product.name} x${quantity}`,
        })
      } else {
        // For customizer products - use local storage with design
        // If no template selected, use first template or create default design
        let design
        if (!templateId && templates.length > 0) {
          // Use first template as default
          const firstTemplate = templates[0]
          const defaultDesign: CustomDesign = {
            productId: product.id,
            templateId: firstTemplate.id,
            colors: {
              band: firstTemplate.defaultColors?.band || '#FFFFFF',
              face: firstTemplate.defaultColors?.face || '#FFFFFF',
              rim: firstTemplate.defaultColors?.rim || '#FFFFFF',
            },
            accessories: [],
            unitPrice: firstTemplate.basePrice || product.price,
          }
          design = defaultDesign
        } else if (templateId) {
          design = getDesign()
        } else {
          // No templates available, use product directly via API
          await addItemByProductId(product.id, quantity)
          toast({
            title: "Đã thêm vào giỏ hàng!",
            description: `${product.name} x${quantity}`,
          })
          router.push("/checkout")
          return
        }

        await addItem(design)
        toast({
          title: "Đã thêm vào giỏ hàng!",
          description: "Xem giỏ hàng để thanh toán",
        })
      }
      
      // Redirect to checkout after adding to cart
      router.push("/checkout")
    } catch (error: any) {
      // If add to cart fails, show error and don't redirect
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      })
    }
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

    if (!product) return

    // If no template selected, use first template or skip
    let design: CustomDesign
    if (!templateId && templates.length > 0) {
      // Use first template as default
      const firstTemplate = templates[0]
      design = {
        productId: product.id,
        templateId: firstTemplate.id,
        colors: {
          band: firstTemplate.defaultColors?.band || '#FFFFFF',
          face: firstTemplate.defaultColors?.face || '#FFFFFF',
          rim: firstTemplate.defaultColors?.rim || '#FFFFFF',
        },
        accessories: [],
        unitPrice: firstTemplate.basePrice || product.price,
      }
    } else if (templateId) {
      design = getDesign()
    } else {
      toast({
        title: "Không thể lưu thiết kế",
        description: "Sản phẩm này không có template",
        variant: "destructive",
      })
      return
    }

    saveDesign(design)
    toast({
      title: "Đã lưu thiết kế!",
      description: "Xem trong 'Thiết kế của tôi'",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="text-center">
          <div className="h-8 w-8 border-[3px] border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-700 text-sm">Đang tải sản phẩm...</p>
        </div>
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
  // Check if product is on sale (only if product exists and has originalPrice > price)
  const isOnSale = product 
    ? (product.originalPrice !== null && product.originalPrice !== undefined && product.originalPrice > product.price)
    : false
  const discount = isOnSale && product && product.originalPrice
    ? product.originalPrice - product.price 
    : 0
  const discountPercent = isOnSale && product && product.originalPrice
    ? Math.round((discount / product.originalPrice) * 100)
    : 0

  return (
    <div className="container py-4 sm:py-6 px-4 sm:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto">
        <Link href="/" className="hover:text-primary whitespace-nowrap">Trang chủ</Link>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <Link href="/products" className="hover:text-primary whitespace-nowrap">Sản phẩm</Link>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="text-primary font-medium truncate">{product.name}</span>
      </div>

      {/* Product Detail Layout */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
        {/* Left: Image Gallery or 2D/3D Preview */}
        <div className="space-y-3 sm:space-y-4">
          {/* Toggle Header - Show for all products if has images */}
          {images.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="inline-flex items-center rounded-full border px-2 sm:px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary text-primary-foreground">
                  {previewMode === "2d" ? "2D Preview" : "3D Preview"}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {previewMode === "2d" ? "Xem thiết kế 2D" : "Trải nghiệm 3D tương tác"}
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant={previewMode === "2d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("2d")}
                  className={`flex-1 sm:flex-initial ${previewMode === "2d" ? "bg-primary" : ""}`}
                >
                  <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">2D</span>
                </Button>
                {hasCustomizer && (
                  <Button
                    variant={previewMode === "3d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("3d")}
                    className={`flex-1 sm:flex-initial ${previewMode === "3d" ? "bg-primary" : ""}`}
                  >
                    <Box className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">3D</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Preview Content */}
          <div className="relative">
            {previewMode === "2d" ? (
              /* 2D Preview: Show images from Cloudinary (imageUrls) */
              <div className="space-y-3 sm:space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square bg-transparent rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <Image
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground" />
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => setSelectedImageIndex((prev) => 
                          prev > 0 ? prev - 1 : images.length - 1
                        )}
                      >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => setSelectedImageIndex((prev) => 
                          prev < images.length - 1 ? prev + 1 : 0
                        )}
                      >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
                      </Button>
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 text-white px-2 py-1 rounded text-xs sm:text-sm">
                        {selectedImageIndex + 1}/{images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImageIndex(index)
                          setPreviewMode("2d")
                        }}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
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
        <div className="space-y-4 sm:space-y-6">
          {/* Product Name */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight flex-1">{product.name}</h1>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleWishlist}
                disabled={checkingWishlist}
                className="flex-shrink-0"
              >
                <Heart
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    isInWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                />
              </Button>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const averageRating = reviews.length > 0 
                  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
                  : 0
                return (
                  <Star
                    key={star}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      star <= Math.floor(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : star <= averageRating
                        ? "fill-yellow-200 text-yellow-200"
                        : "fill-muted text-muted"
                    }`}
                  />
                )
              })}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              ({reviews.length} đánh giá)
            </span>
            {product && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                Đã bán {soldQuantity}
              </span>
            )}
          </div>
          
          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="font-medium text-sm sm:text-base">Màu sắc:</span>
                <span className="text-xs sm:text-sm text-muted-foreground">
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
                    className={`text-xs sm:text-sm ${selectedColor === color ? "bg-primary" : ""}`}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Price */}
          <div className="space-y-1 sm:space-y-2">
            {isOnSale ? (
              <>
                <div className="text-xs sm:text-sm text-muted-foreground">Giá khuyến mãi:</div>
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice!)}
                  </span>
                  {discountPercent > 0 && (
                    <Badge variant="destructive" className="text-xs sm:text-sm">
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>
                {discount > 0 && (
                  <div className="text-xs sm:text-sm text-green-600 font-medium">
                    Tiết kiệm: {formatCurrency(discount)}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-muted-foreground">Giá:</span>
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
              </div>
            )}
          </div>
          
          {/* Additional Benefits */}
          <div>
            <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Ưu đãi thêm:</div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
              <span>✓</span>
              <span>Freeship khi thanh toán trước đơn hàng</span>
            </div>
          </div>
          
          {/* Brand */}
          {product.brand && (
            <div className="text-xs sm:text-sm">
              <span className="text-muted-foreground">Thương hiệu: </span>
              <span className="font-medium">{product.brand}</span>
            </div>
          )}
          
          {/* Quantity */}
          <div>
            <div className="text-xs sm:text-sm font-medium mb-2">Số lượng:</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
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
                className="w-16 sm:w-20 text-center text-sm sm:text-base"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setQuantity((prev) => 
                  Math.min(product.stockQuantity, prev + 1)
                )}
                disabled={quantity >= product.stockQuantity}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              onClick={handleBuyNow}
              className="w-full bg-white border-2 border-primary text-primary hover:bg-pink-50 hover:border-primary/90 text-sm sm:text-base"
              size="lg"
            >
              MUA NGAY
            </Button>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">THÊM VÀO GIỎ HÀNG</span>
              <span className="sm:hidden">THÊM VÀO GIỎ</span>
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs sm:text-sm"
              onClick={() => {
                window.open("https://zalo.me/your-zalo-id", "_blank")
              }}
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Tư vấn qua Zalo
            </Button>
            <Button
              variant="outline"
              className="w-full text-xs sm:text-sm"
              onClick={() => {
                window.open("https://facebook.com/your-page", "_blank")
              }}
            >
              <Facebook className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Tư vấn qua Facebook
            </Button>
          </div>
        </div>
      </div>

      {/* Product Images Gallery */}
      {product.images && product.images.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
            {product.images.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-border">
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

      <Tabs defaultValue="details" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-2">
          <TabsTrigger value="details" className="text-xs sm:text-sm">CHI TIẾT SẢN PHẨM</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm">ĐÁNH GIÁ ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 sm:space-y-6">
          <Card className="border-2 rounded-xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="prose max-w-none">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">1. Giới thiệu {product.name}</h2>
                <div className="space-y-4">
                  <div 
                    className={`text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed transition-all duration-300 ${
                      !isDescriptionExpanded ? "line-clamp-4" : ""
                    }`}
                  >
                    {product.description || "Không có mô tả chi tiết."}
                  </div>
                  {product.description && product.description.length > 200 && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-primary border-primary hover:bg-primary hover:text-white"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            Thu gọn
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Xem thêm
                            <ChevronUp className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {product.images && product.images.length > 0 && (
                <div className="flex justify-center my-6 sm:my-8">
                  <div className="relative w-full max-w-2xl aspect-square">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Only show specs/features if product has them (for customizer products) */}
          {(product as any).specs || (product as any).features ? (
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
              {(product as any).specs && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-primary">Thông số kỹ thuật</h2>
                  <div className="space-y-2 sm:space-y-3">
                    {(product as any).specs.waterproof && (
                      <div className="flex justify-between items-center py-2 border-b text-sm sm:text-base">
                        <span className="text-muted-foreground">Chống nước:</span>
                        <Badge className="text-xs sm:text-sm">{(product as any).specs.waterproof}</Badge>
                      </div>
                    )}
                    {(product as any).specs.battery && (
                      <div className="flex justify-between items-center py-2 border-b text-sm sm:text-base">
                        <span className="text-muted-foreground">Pin:</span>
                        <span>{(product as any).specs.battery}</span>
                      </div>
                    )}
                    {(product as any).specs.gps !== undefined && (
                      <div className="flex justify-between items-center py-2 border-b text-sm sm:text-base">
                        <span className="text-muted-foreground">GPS:</span>
                        <span>{(product as any).specs.gps ? "Có" : "Không"}</span>
                      </div>
                    )}
                    {(product as any).specs.simCard !== undefined && (
                      <div className="flex justify-between items-center py-2 border-b text-sm sm:text-base">
                        <span className="text-muted-foreground">SIM:</span>
                        <span>{(product as any).specs.simCard ? "Có" : "Không"}</span>
                      </div>
                    )}
                    {(product as any).specs.weight && (
                      <div className="flex justify-between items-center py-2 border-b text-sm sm:text-base">
                        <span className="text-muted-foreground">Trọng lượng:</span>
                        <span>{(product as any).specs.weight}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(product as any).features && (product as any).features.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Tính năng</h2>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {(product as any).features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm sm:text-base">
                        <span className="text-primary mt-1 flex-shrink-0">✓</span>
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 sm:space-y-6">
          {loadingReviews ? (
            <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground">
              Đang tải đánh giá...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {/* Rating Summary */}
                <div className="text-center sm:col-span-2 md:col-span-1">
                  {reviews.length > 0 ? (
                    <>
                      <div className="text-4xl sm:text-5xl font-bold mb-2">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </div>
                      <div className="flex justify-center gap-0.5 sm:gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                          return (
                            <Star
                              key={star}
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                star <= averageRating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : star <= Math.ceil(averageRating)
                                  ? "text-yellow-200 fill-yellow-200"
                                  : "text-muted fill-muted"
                              }`}
                            />
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl sm:text-5xl font-bold mb-2">0.0</div>
                      <div className="flex justify-center gap-0.5 sm:gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 sm:h-6 sm:w-6 text-muted fill-muted" />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">ĐÁNH GIÁ TRUNG BÌNH</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{reviews.length} đánh giá</div>
                </div>

            {/* Rating Breakdown */}
            <div className="space-y-2 sm:col-span-2 md:col-span-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-8 sm:w-10 text-xs sm:text-sm flex-shrink-0 flex items-center justify-start">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{rating}</span>
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-0">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground w-20 sm:w-24 text-right flex-shrink-0">
                      {percentage.toFixed(0)}% | {count}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Rate Button */}
            <div className="flex items-center justify-center sm:col-span-2 md:col-span-1">
              <Button 
                onClick={() => {
                  // Load user info if logged in, otherwise load saved info from localStorage
                  if (user) {
                    setReviewFullName(user.fullName || user.name || "")
                    setReviewEmail(user.email || "")
                    setReviewPhoneNumber(user.phoneNumber || "")
                  } else if (typeof window !== "undefined") {
                    const savedName = localStorage.getItem("reviewFullName")
                    const savedEmail = localStorage.getItem("reviewEmail")
                    if (savedName) setReviewFullName(savedName)
                    if (savedEmail) setReviewEmail(savedEmail)
                  }
                  setReviewDialogOpen(true)
                }}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-xs sm:text-sm"
              >
                ĐÁNH GIÁ NGAY
              </Button>
            </div>
          </div>

          {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-muted-foreground">
                  Chưa có đánh giá nào cho sản phẩm này.
                </div>
              ) : (
                <div className="space-y-6 mt-8">
                  {reviews.map((review) => {
                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString)
                      const day = date.getDate()
                      const month = date.getMonth() + 1
                      const year = date.getFullYear()
                      return `${day}/${month}/${year}`
                    }

                    // Get first letter of last word in name (e.g., "Bích Tuyền" -> "T")
                    const getInitial = (name: string) => {
                      const words = name.trim().split(/\s+/)
                      if (words.length > 0) {
                        // Get last word's first letter
                        const lastWord = words[words.length - 1]
                        return lastWord.charAt(0).toUpperCase()
                      }
                      return name.charAt(0).toUpperCase()
                    }

                    // Check if this review belongs to the current logged-in user
                    // Check by userId first, then fallback to fullName match
                    const isCurrentUserReview = user && (
                      (review.userId && review.userId === user.id) ||
                      (review.fullName && (review.fullName === user.fullName || review.fullName === user.name))
                    )
                    const reviewAvatar = isCurrentUserReview && user.avatar ? user.avatar : null

                    // Get avatar URL - handle Cloudinary URLs
                    const getAvatarUrl = () => {
                      if (!reviewAvatar) return null
                      
                      // If it's already a full URL (http/https), return as is
                      if (reviewAvatar.startsWith('http://') || reviewAvatar.startsWith('https://')) {
                        return reviewAvatar
                      }
                      
                      // If it's already a Cloudinary URL (contains res.cloudinary.com), return as is
                      if (reviewAvatar.includes('res.cloudinary.com')) {
                        return reviewAvatar
                      }
                      
                      // If it's a Cloudinary public_id or path, construct the URL
                      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'
                      
                      // If it starts with /, it's a path - prepend Cloudinary base URL
                      if (reviewAvatar.startsWith('/')) {
                        return `https://res.cloudinary.com/${cloudName}/image/upload${reviewAvatar}`
                      }
                      
                      // Otherwise, assume it's a public_id and construct URL
                      const publicId = reviewAvatar.replace(/^\/+/, '')
                      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
                    }

                    const avatarUrl = getAvatarUrl()

                    return (
                      <Card key={review.id} className="border">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex gap-4">
                            {/* Avatar - Show user avatar if logged in, otherwise show initial */}
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {avatarUrl ? (
                                <Image
                                  src={avatarUrl}
                                  alt={review.fullName}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                  onError={(e) => {
                                    // Fallback to initial if image fails to load
                                    e.currentTarget.style.display = 'none'
                                    const parent = e.currentTarget.parentElement
                                    if (parent) {
                                      const fallback = document.createElement('span')
                                      fallback.className = 'text-primary font-semibold'
                                      fallback.textContent = getInitial(review.fullName)
                                      parent.appendChild(fallback)
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-primary font-semibold">
                                  {getInitial(review.fullName)}
                                </span>
                              )}
                            </div>

                            {/* Review Content */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                  <div className="font-semibold text-sm sm:text-base">{review.fullName}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300 fill-gray-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                                      {formatDate(review.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {review.comment && (
                                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap">
                                  {review.comment}
                                </p>
                              )}

                              {review.reviewImageUrl && (
                                <div className="mt-3">
                                  <Image
                                    src={review.reviewImageUrl}
                                    alt="Review image"
                                    width={200}
                                    height={200}
                                    className="rounded-lg object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-8 sm:mt-12 md:mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">SẢN PHẨM TƯƠNG TỰ</h2>
            <Button variant="outline" asChild size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
              <Link href="/products">
                Xem thêm <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-2 rotate-[-90deg]" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8 sm:mt-12 md:mt-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Bình luận</h2>
        
        {/* Comment Form */}
        <div className="mb-4 sm:mb-6">
          <div className="pt-4 sm:pt-6 px-0">
            <Textarea
              placeholder={user ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user}
              className="min-h-[80px] sm:min-h-[100px] mb-3 sm:mb-4 text-sm sm:text-base"
            />
            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  if (!user) {
                    toast({
                      title: "Vui lòng đăng nhập",
                      description: "Đăng nhập để bình luận",
                      variant: "destructive",
                    })
                    return
                  }
                  if (!commentText.trim() || !product?.slug) return
                  
                  try {
                    const newComment = await makeAuthenticatedRequest(async (token) => {
                      return await productCommentsApi.create(token, product.slug, {
                        content: commentText.trim(),
                      })
                    })

                    // Refresh comments
                    await refreshComments()
                    
                    setCommentText("")
                    toast({
                      title: "Đã gửi bình luận",
                      description: "Bình luận của bạn đã được đăng",
                    })
                  } catch (error: any) {
                    console.error("Error creating comment:", error)
                    toast({
                      title: "Lỗi",
                      description: error.message || "Không thể gửi bình luận",
                      variant: "destructive",
                    })
                  }
                }}
                disabled={!commentText.trim() || loadingComments}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {loadingComments ? (
                  <>
                    <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Gửi bình luận
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {loadingComments ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                user={user}
                productSlug={product?.slug || ""}
                onReply={(id: string | null) => {
                  setReplyingTo(id)
                  setReplyText("")
                }}
                onDelete={async (id) => {
                  if (!user?.accessToken || !product?.slug) return
                  
                  try {
                    await makeAuthenticatedRequest(async (token) => {
                      await productCommentsApi.delete(token, product.slug, id)
                    })

                    // Refresh comments
                    await refreshComments()
                    
                    toast({
                      title: "Đã xóa bình luận",
                      description: "Bình luận đã được xóa thành công",
                    })
                  } catch (error: any) {
                    console.error("Error deleting comment:", error)
                    toast({
                      title: "Lỗi",
                      description: error.message || "Không thể xóa bình luận",
                      variant: "destructive",
                    })
                  }
                }}
                onReplySubmit={async (parentId: string, replyContent: string) => {
                  if (!user?.accessToken || !product?.slug) return
                  
                  try {
                    await makeAuthenticatedRequest(async (token) => {
                      await productCommentsApi.reply(token, product.slug, parentId, {
                        content: replyContent.trim(),
                      })
                    })

                    // Refresh comments
                    await refreshComments()
                    
                    setReplyingTo(null)
                    setReplyText("")
                    toast({
                      title: "Đã gửi phản hồi",
                      description: "Phản hồi của bạn đã được đăng",
                    })
                  } catch (error: any) {
                    console.error("Error replying to comment:", error)
                    toast({
                      title: "Lỗi",
                      description: error.message || "Không thể gửi phản hồi",
                      variant: "destructive",
                    })
                  }
                }}
                replyingTo={replyingTo}
                replyText={replyText}
                onReplyTextChange={setReplyText}
              />
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Subscription */}
      <Card className="mt-8 sm:mt-12 md:mt-16 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Đăng ký nhận thông tin</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
            Nhận các chương trình khuyến mãi, thông báo sản phẩm mới và các ưu đãi khác dành riêng cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Nhập Email của bạn"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 text-sm sm:text-base"
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
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-xs sm:text-sm"
            >
              ĐĂNG KÝ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Đánh giá {product?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Star Rating */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Bạn cảm thấy thế nào về sản phẩm? (Chọn sao)
              </Label>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 sm:h-12 sm:w-12 ${
                          star <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 text-xs sm:text-sm text-muted-foreground mt-2">
                  <span className={reviewRating >= 1 ? "font-semibold text-foreground" : ""}>
                    Rất tệ
                  </span>
                  <span className={reviewRating >= 2 ? "font-semibold text-foreground" : ""}>
                    Không tệ
                  </span>
                  <span className={reviewRating >= 3 ? "font-semibold text-foreground" : ""}>
                    Trung bình
                  </span>
                  <span className={reviewRating >= 4 ? "font-semibold text-foreground" : ""}>
                    Tốt
                  </span>
                  <span className={reviewRating >= 5 ? "font-semibold text-foreground" : ""}>
                    Tuyệt vời
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-2">
              <Textarea
                placeholder="Mời bạn chia sẻ thêm một số cảm nhận..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="min-h-[120px] text-sm sm:text-base"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sendPhoto"
                    checked={reviewSendPhoto}
                    onCheckedChange={(checked) => {
                      setReviewSendPhoto(checked as boolean)
                      if (!checked) {
                        setReviewPhotoUrls([])
                        setReviewPhotoFiles([])
                        if (reviewPhotoInputRef.current) {
                          reviewPhotoInputRef.current.value = ""
                        }
                      }
                    }}
                  />
                  <Label htmlFor="sendPhoto" className="text-xs cursor-pointer">
                    Gửi ảnh thực tế
                  </Label>
                </div>
                <span>
                  {reviewComment.length} ký tự {reviewComment.length < 10 && "(Tối thiểu 10)"}
                </span>
              </div>
            </div>

            {/* Photo Upload Section */}
            {reviewSendPhoto && (
              <div className="space-y-3">
                <input
                  ref={reviewPhotoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length === 0) return

                    // Validate all files
                    for (const file of files) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        toast({
                          title: "File quá lớn",
                          description: `${file.name} có kích thước lớn hơn 5MB`,
                          variant: "destructive",
                        })
                        return
                      }

                      // Validate file type
                      if (!file.type.startsWith("image/")) {
                        toast({
                          title: "File không hợp lệ",
                          description: `${file.name} không phải là file ảnh`,
                          variant: "destructive",
                        })
                        return
                      }
                    }

                    setUploadingPhoto(true)
                    const newFiles: File[] = []
                    const newUrls: string[] = []

                    try {
                      // Upload all files to Cloudinary
                      for (const file of files) {
                        try {
                          const result = await uploadImageToCloudinary(file)
                          newUrls.push(result.secure_url)
                          newFiles.push(file)
                        } catch (error: any) {
                          console.error("Upload error for file:", file.name, error)
                          toast({
                            title: "Upload thất bại",
                            description: `Không thể tải ${file.name}: ${error.message || "Lỗi không xác định"}`,
                            variant: "destructive",
                          })
                        }
                      }

                      if (newUrls.length > 0) {
                        setReviewPhotoUrls([...reviewPhotoUrls, ...newUrls])
                        setReviewPhotoFiles([...reviewPhotoFiles, ...newFiles])
                        toast({
                          title: "Upload thành công!",
                          description: `Đã tải lên ${newUrls.length} ảnh`,
                        })
                      }
                    } catch (error: any) {
                      console.error("Upload error:", error)
                    } finally {
                      setUploadingPhoto(false)
                      // Reset input to allow selecting same files again
                      if (reviewPhotoInputRef.current) {
                        reviewPhotoInputRef.current.value = ""
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reviewPhotoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-full"
                >
                  {uploadingPhoto ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Chọn ảnh
                    </>
                  )}
                </Button>
                {reviewPhotoUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {reviewPhotoUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                        <Image
                          src={url}
                          alt={`Review photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={() => {
                            setReviewPhotoUrls(reviewPhotoUrls.filter((_, i) => i !== index))
                            setReviewPhotoFiles(reviewPhotoFiles.filter((_, i) => i !== index))
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewFullName" className="text-sm font-medium">
                  Họ tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reviewFullName"
                  value={reviewFullName}
                  onChange={(e) => setReviewFullName(e.target.value)}
                  placeholder="Nhập họ tên"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewPhoneNumber" className="text-sm font-medium">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reviewPhoneNumber"
                  type="tel"
                  value={reviewPhoneNumber}
                  onChange={(e) => setReviewPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewEmail" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="reviewEmail"
                  type="email"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  placeholder="Nhập email"
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Save Info Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="saveInfo"
                checked={reviewSaveInfo}
                onCheckedChange={(checked) => setReviewSaveInfo(checked as boolean)}
              />
              <Label htmlFor="saveInfo" className="text-xs sm:text-sm text-muted-foreground cursor-pointer leading-relaxed">
                Lưu tên của tôi, email, và trang web trong trình duyệt này cho lần bình luận kế tiếp của tôi.
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false)
                setReviewRating(0)
                setReviewComment("")
                setReviewFullName("")
                setReviewPhoneNumber("")
                setReviewEmail("")
                setReviewSendPhoto(false)
                setReviewSaveInfo(false)
                setReviewPhotoUrls([])
                setReviewPhotoFiles([])
                if (reviewPhotoInputRef.current) {
                  reviewPhotoInputRef.current.value = ""
                }
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!reviewFullName.trim() || !reviewPhoneNumber.trim()) {
                  toast({
                    title: "Vui lòng điền đầy đủ thông tin",
                    description: "Họ tên và số điện thoại là bắt buộc",
                    variant: "destructive",
                  })
                  return
                }
                if (reviewRating === 0) {
                  toast({
                    title: "Vui lòng chọn đánh giá",
                    description: "Bạn cần chọn số sao đánh giá",
                    variant: "destructive",
                  })
                  return
                }
                if (reviewComment.length > 0 && reviewComment.length < 10) {
                  toast({
                    title: "Bình luận quá ngắn",
                    description: "Bình luận phải có ít nhất 10 ký tự",
                    variant: "destructive",
                  })
                  return
                }
                
                // If sendPhoto is checked but there are files not uploaded yet, try to upload them
                let finalPhotoUrls = [...reviewPhotoUrls]
                if (reviewSendPhoto && reviewPhotoFiles.length > reviewPhotoUrls.length) {
                  setUploadingPhoto(true)
                  const filesToUpload = reviewPhotoFiles.slice(reviewPhotoUrls.length)
                  
                  try {
                    for (const file of filesToUpload) {
                      try {
                        const result = await uploadImageToCloudinary(file)
                        finalPhotoUrls.push(result.secure_url)
                      } catch (error: any) {
                        toast({
                          title: "Upload ảnh thất bại",
                          description: error.message || "Không thể tải ảnh lên",
                          variant: "destructive",
                        })
                        setUploadingPhoto(false)
                        return
                      }
                    }
                  } finally {
                    setUploadingPhoto(false)
                  }
                }
                
                // Save to localStorage if user wants
                if (reviewSaveInfo) {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("reviewFullName", reviewFullName)
                    localStorage.setItem("reviewEmail", reviewEmail)
                  }
                }

                // Prepare review data to send to backend
                try {
                  if (!product?.id && !product?.slug) {
                    toast({
                      title: "Lỗi",
                      description: "Không tìm thấy sản phẩm",
                      variant: "destructive",
                    })
                    return
                  }

                  const productIdOrSlug = product.id || product.slug
                  
                  // Submit review to API
                  await productReviewsApi.create(productIdOrSlug, {
                    fullName: reviewFullName,
                    phoneNumber: reviewPhoneNumber,
                    email: reviewEmail || undefined,
                    rating: reviewRating,
                    comment: reviewComment,
                    reviewImageUrl: finalPhotoUrls.length > 0 ? finalPhotoUrls[0] : null, // API only accepts single image URL
                  })

                  // Refresh reviews
                  await refreshReviews()

                  // Close dialog and reset form
                  setReviewDialogOpen(false)
                  setReviewRating(0)
                  setReviewComment("")
                  setReviewFullName("")
                  setReviewPhoneNumber("")
                  setReviewEmail("")
                  setReviewSendPhoto(false)
                  setReviewSaveInfo(false)
                  setReviewPhotoUrls([])
                  setReviewPhotoFiles([])
                  if (reviewPhotoInputRef.current) {
                    reviewPhotoInputRef.current.value = ""
                  }

                  toast({
                    title: "Đánh giá thành công!",
                    description: "Cảm ơn bạn đã đánh giá sản phẩm",
                  })
                } catch (error: any) {
                  console.error("Error submitting review:", error)
                  toast({
                    title: "Lỗi",
                    description: error.message || "Không thể gửi đánh giá",
                    variant: "destructive",
                  })
                }
              }}
              className="bg-primary hover:bg-primary/90"
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                "GỬI ĐÁNH GIÁ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Comment Item Component
function CommentItem({
  comment,
  user,
  productSlug,
  onReply,
  onDelete,
  onReplySubmit,
  replyingTo,
  replyText,
  onReplyTextChange,
  isNestedReply = false,
}: {
  comment: ProductComment
  user: any
  productSlug: string
  onReply: (id: string | null) => void
  onDelete: (id: string) => void
  onReplySubmit?: (parentId: string, content: string) => Promise<void>
  replyingTo?: string | null
  replyText?: string
  onReplyTextChange?: (text: string) => void
  isNestedReply?: boolean
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

  // Check if this comment belongs to the current user
  const isCurrentUserComment = user && comment.userId === user.id
  
  // Get user name from various possible API response formats
  // If it's the current user's comment, prioritize user store data (latest info)
  // Otherwise, use comment data from API
  const authorName = isCurrentUserComment && user.fullName
    ? user.fullName
    : comment.userName || 
      comment.userFullName || 
      comment.fullName || 
      comment.user?.fullName || 
      comment.userEmail || 
      comment.email || 
      comment.user?.email || 
      "Người dùng"
  
  // Get avatar - prioritize user store for current user's comments
  const authorAvatar = isCurrentUserComment && user.avatar
    ? user.avatar
    : comment.userAvatar || comment.avatar || comment.user?.avatar || null
  const isReplying = replyingTo === comment.id
  // Only admin can delete (role === 1)
  const canDelete = user && (user.role === 1 || user.role === "1")

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {authorAvatar ? (
            <Image src={authorAvatar} alt={authorName} width={40} height={40} className="rounded-full" />
          ) : (
            <span className="text-primary font-semibold">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{authorName}</span>
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
            {canDelete && (
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

          {/* Reply Form */}
          {isReplying && onReplySubmit && onReplyTextChange !== undefined && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Viết phản hồi của bạn..."
                value={replyText || ""}
                onChange={(e) => onReplyTextChange(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onReplySubmit(comment.id, replyText || "")}
                  disabled={!replyText?.trim()}
                  className="text-xs"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Gửi
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (onReply) onReply(null)
                    if (onReplyTextChange) onReplyTextChange("")
                  }}
                  className="text-xs"
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={isNestedReply ? "space-y-4" : "ml-14 space-y-4"}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              user={user}
              productSlug={productSlug}
              onReply={onReply}
              onDelete={onDelete}
              onReplySubmit={onReplySubmit}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              isNestedReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

