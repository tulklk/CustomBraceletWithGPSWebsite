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
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminProduct, AdminCategory } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/admin/ImageUpload"

export default function ProductsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    brand: "",
    categoryId: "none",
    imageUrl: "",
    images: [] as string[],
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
        adminApi.products.getAll(user.accessToken),
        adminApi.categories.getAll(user.accessToken),
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
        price: product.price.toString() || "",
        stock: product.stock.toString() || "",
        brand: product.brand || "",
        categoryId: product.categoryId || "none",
        imageUrl: product.imageUrl || "",
        images: product.images || (product.imageUrl ? [product.imageUrl] : []),
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        brand: "",
        categoryId: "none",
        imageUrl: "",
        images: [],
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
      price: "",
      stock: "",
      brand: "",
      categoryId: "none",
      imageUrl: "",
      images: [],
    })
  }

  const handleSubmit = async () => {
    if (!user?.accessToken) return
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        brand: formData.brand || null,
        categoryId: formData.categoryId && formData.categoryId !== "none" ? formData.categoryId : null,
        imageUrl: formData.images.length > 0 ? formData.images[0] : (formData.imageUrl || null),
        images: formData.images.length > 0 ? formData.images : (formData.imageUrl ? [formData.imageUrl] : []),
      }

      if (editingProduct) {
        await adminApi.products.update(user.accessToken, editingProduct.id, productData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật sản phẩm",
        })
      } else {
        await adminApi.products.create(user.accessToken, productData)
        toast({
          title: "Thành công",
          description: "Đã tạo sản phẩm mới",
        })
      }
      handleCloseDialog()
      fetchData()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu sản phẩm",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!user?.accessToken) return
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return

    try {
      await adminApi.products.delete(user.accessToken, id)
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm",
      })
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
      render: (product: AdminProduct) => (
        <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      ),
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
      render: (product: AdminProduct) => (
        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
          {product.stock}
        </Badge>
      ),
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
            onClick={() => handleDelete(product.id)}
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
              {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Cập nhật thông tin sản phẩm"
                : "Tạo sản phẩm mới cho cửa hàng"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả sản phẩm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Tồn kho *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Thương hiệu</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Nhập thương hiệu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Danh mục</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm</Label>
              <ImageUpload
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls, imageUrl: urls[0] || "" })}
                maxImages={5}
                multiple={true}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
