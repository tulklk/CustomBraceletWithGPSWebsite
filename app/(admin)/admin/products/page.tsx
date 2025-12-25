"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, Package, X } from "lucide-react"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminProduct, AdminCategory } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, slugify } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProductsPage() {
  const { user, makeAuthenticatedRequest } = useUser()
  const { toast } = useToast()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0",
    originalPrice: "",
    stockQuantity: "0",
    brand: "",
    categoryId: "none",
    imageUrls: [] as string[],
    isActive: true,
    hasVariants: false,
    variants: [] as Array<{
      color: string
      size: string
      spec: string
      price: string
      originalPrice: string
      stockQuantity: string
      isActive: boolean
    }>,
  })

  useEffect(() => {
    if (!user?.accessToken) return
    fetchData()
  }, [user?.accessToken])

  const fetchData = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        makeAuthenticatedRequest((token) => adminApi.products.getAll(token)),
        makeAuthenticatedRequest((token) => adminApi.categories.getAll(token)),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải dữ liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "0",
        originalPrice: (product as any).originalPrice?.toString() || "",
        stockQuantity: (product.stockQuantity ?? product.stock)?.toString() || "0",
        brand: product.brand || "",
        categoryId: product.categoryId || "none",
        imageUrls: product.imageUrls || product.images || (product.imageUrl ? [product.imageUrl] : []),
        isActive: (product as any).isActive ?? true,
        hasVariants: (product as any).hasVariants ?? false,
        variants: (product as any).variants || [],
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "0",
        originalPrice: "",
        stockQuantity: "0",
        brand: "",
        categoryId: "none",
        imageUrls: [],
        isActive: true,
        hasVariants: false,
        variants: [],
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "0",
      originalPrice: "",
      stockQuantity: "0",
      brand: "",
      categoryId: "none",
      imageUrls: [],
      isActive: true,
      hasVariants: false,
      variants: [],
    })
  }

  const handleSubmit = async () => {
    if (!user?.accessToken) return
    if (!formData.name.trim() || !formData.price || !formData.stockQuantity) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    if (formData.categoryId === "none") {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn danh mục",
        variant: "destructive",
      })
      return
    }

    try {
      // Generate slug from name
      // If editing and product has slug, keep it; otherwise generate new one
      const slug = editingProduct?.slug || slugify(formData.name)
      
      // Ensure imageUrls are valid strings
      const imageUrls = formData.imageUrls.filter((url) => url && typeof url === "string" && url.trim() !== "")
      
      console.log("Form data imageUrls:", formData.imageUrls)
      console.log("Filtered imageUrls:", imageUrls)
      
      const productData: any = {
        name: formData.name,
        slug: slug,
        description: formData.description || null,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        brand: formData.brand && formData.brand !== "none" ? formData.brand : null,
        isActive: formData.isActive,
        imageUrls: imageUrls,
      }
      
      // Also send as 'images' for backward compatibility (backend might expect this)
      if (imageUrls.length > 0) {
        productData.images = imageUrls
      }
      
      console.log("Product data to send:", productData)

      if (formData.hasVariants && formData.variants.length > 0) {
        productData.variants = formData.variants.map((variant) => ({
          color: variant.color || null,
          size: variant.size || null,
          spec: variant.spec || null,
          price: parseFloat(variant.price) || 0,
          originalPrice: variant.originalPrice ? parseFloat(variant.originalPrice) : null,
          stockQuantity: parseInt(variant.stockQuantity) || 0,
          isActive: variant.isActive,
        }))
      }

      if (editingProduct) {
        const updatedProduct = await makeAuthenticatedRequest((token) => 
          adminApi.products.update(token, editingProduct.id, productData)
        )
        toast({
          title: "Thành công",
          description: "Đã cập nhật sản phẩm",
        })
        // Force refresh data to get updated images
        await fetchData()
        // Update the product in the list immediately with new data
        setProducts((prevProducts) =>
          prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        )
      } else {
        await makeAuthenticatedRequest((token) => 
          adminApi.products.create(token, productData)
        )
        toast({
          title: "Thành công",
          description: "Đã tạo sản phẩm mới",
        })
        await fetchData()
      }
      handleCloseDialog()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu sản phẩm",
        variant: "destructive",
      })
    }
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          color: "",
          size: "",
          spec: "",
          price: "0",
          originalPrice: "",
          stockQuantity: "0",
          isActive: true,
        },
      ],
    })
  }

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    })
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData({ ...formData, variants: newVariants })
  }

  const handleDeleteClick = (product: AdminProduct) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user?.accessToken || !productToDelete) return

    try {
      await makeAuthenticatedRequest((token) => adminApi.products.delete(token, productToDelete.id))
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm",
      })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa sản phẩm",
        variant: "destructive",
      })
    }
  }

  const columns = [
    {
      key: "imageUrl",
      label: "Hình ảnh",
      render: (product: AdminProduct) => {
        // Get image URL from images array, imageUrls array, or imageUrl field
        const imageUrl = 
          (product.images && product.images.length > 0) ? product.images[0] :
          (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] :
          product.imageUrl || null
        
        // Add cache-busting query param to force refresh when image is updated
        const imageUrlWithCacheBust = imageUrl 
          ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${product.updatedAt || product.id || Date.now()}`
          : null
        
        return (
          <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center border relative">
            {imageUrlWithCacheBust ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${product.id}-${imageUrl}`} // Force re-render when imageUrl changes
                src={imageUrlWithCacheBust}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Replace with Package icon on error
                  const target = e.target as HTMLImageElement
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = '<svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>'
                  }
                }}
              />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        )
      },
    },
    {
      key: "name",
      label: "Tên",
      sortable: true,
      render: (product: AdminProduct) => (
        <span className="font-medium">{product.name}</span>
      ),
    },
    {
      key: "price",
      label: "Giá bán",
      sortable: true,
      render: (product: AdminProduct) => (
        <span className="font-medium">{formatCurrency(product.price)}</span>
      ),
    },
    {
      key: "stock",
      label: "Tồn kho",
      sortable: true,
      render: (product: AdminProduct) => {
        const stock = product.stockQuantity ?? product.stock ?? 0
        return (
          <Badge variant={stock > 0 ? "default" : "destructive"}>
            {stock}
          </Badge>
        )
      },
    },
    {
      key: "brand",
      label: "Thương hiệu",
      sortable: true,
      render: (product: AdminProduct) => product.brand || "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (product: AdminProduct) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Xem">
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDialog(product)}
            title="Sửa"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(product)}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QUẢN LÝ SẢN PHẨM</h1>
          <p className="text-muted-foreground mt-1">
            Sản phẩm - Danh sách toàn bộ sản phẩm đang kinh doanh trên cửa hàng.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/products" target="_blank">Xem trên cửa hàng</a>
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>TÌM KIẾM SẢN PHẨM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tìm theo tên, giá bán hoặc thương hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div>
            <Label>LỌC THEO DANH MỤC GỐC</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredProducts}
            columns={columns}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Sửa sản phẩm" : "Tạo sản phẩm mới"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Cập nhật thông tin sản phẩm"
                : "Tạo sản phẩm mới cho cửa hàng"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Danh mục *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Thương hiệu</Label>
              <Select 
                value={formData.brand || "none"} 
                onValueChange={(value) => setFormData({ ...formData, brand: value === "none" ? "" : value })}
                disabled={formData.categoryId === "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.categoryId === "none" ? "Chọn danh mục trước" : "Chọn thương hiệu"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có thương hiệu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Giá gốc (nếu có)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder=""
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Tồn kho</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả sản phẩm"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm</Label>
              <ImageUpload
                value={formData.imageUrls}
                onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                maxImages={5}
                multiple={true}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="hasVariants" className="text-base">
                  Sản phẩm có variants (màu sắc, size, thông số)
                </Label>
              </div>
              <Switch
                id="hasVariants"
                checked={formData.hasVariants}
                onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
              />
            </div>
            {formData.hasVariants && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Variants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm variant
                  </Button>
                </div>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="space-y-3 p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Variant {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Màu sắc"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                      />
                      <Input
                        placeholder="Size"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                      />
                      <Input
                        placeholder="Thông số"
                        value={variant.spec}
                        onChange={(e) => updateVariant(index, "spec", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Giá"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Giá gốc"
                        value={variant.originalPrice}
                        onChange={(e) => updateVariant(index, "originalPrice", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Tồn kho"
                          value={variant.stockQuantity}
                          onChange={(e) => updateVariant(index, "stockQuantity", e.target.value)}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`variant-active-${index}`}
                          checked={variant.isActive}
                          onCheckedChange={(checked) => updateVariant(index, "isActive", checked)}
                        />
                        <Label htmlFor={`variant-active-${index}`} className="text-sm">
                          Kích hoạt
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <Label htmlFor="isActive" className="text-base font-normal cursor-pointer">
                Kích hoạt sản phẩm
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Lưu sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              Xác nhận xóa sản phẩm
            </DialogTitle>
            <DialogDescription className="pt-4">
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-foreground">&ldquo;{productToDelete?.name}&rdquo;</span>?
              <br />
              <span className="text-destructive font-medium">Hành động này không thể hoàn tác.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setProductToDelete(null)
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
