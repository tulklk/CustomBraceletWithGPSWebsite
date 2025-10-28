"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productFilter, setProductFilter] = useState<string>("all")
  const { toast } = useToast()

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching products:", error)
        setLoading(false)
      })
  }, [])

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Tên sản phẩm",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          {product.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <span className="font-medium">{product.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
    },
    {
      key: "priceFrom",
      label: "Giá từ",
      sortable: true,
      render: (product: Product) => (
        <span className="font-medium">
          {product.priceFrom.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "specs",
      label: "Tính năng",
      render: (product: Product) => (
        <div className="flex gap-1">
          {product.specs?.gps && <Badge variant="secondary">GPS</Badge>}
          {product.specs?.simCard && <Badge variant="secondary">SIM</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(product)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(product.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      setProducts(products.filter((p) => p.id !== id))
      toast({
        title: "Đã xóa sản phẩm",
        description: "Sản phẩm đã được xóa thành công",
      })
    }
  }

  const handleSave = () => {
    // Save logic here
    setDialogOpen(false)
    setEditingProduct(null)
    toast({
      title: "Đã lưu",
      description: "Sản phẩm đã được cập nhật thành công",
    })
  }

  // Filter products based on type
  const filteredProducts = products.filter((product) => {
    if (productFilter === "all") return true
    if (productFilter === "bracelet") return product.id.startsWith("bunny-")
    if (productFilter === "necklace") return product.id.startsWith("necklace-")
    if (productFilter === "clip") return product.id.startsWith("clip-")
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý sản phẩm vòng đeo tay GPS
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={productFilter} onValueChange={setProductFilter}>
        <TabsList>
          <TabsTrigger value="all">
            Tất cả ({products.length})
          </TabsTrigger>
          <TabsTrigger value="bracelet">
            Vòng tay ({products.filter(p => p.id.startsWith("bunny-")).length})
          </TabsTrigger>
          <TabsTrigger value="necklace">
            Dây chuyền ({products.filter(p => p.id.startsWith("necklace-")).length})
          </TabsTrigger>
          <TabsTrigger value="clip">
            Pin kẹp quần áo ({products.filter(p => p.id.startsWith("clip-")).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Products Table */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        searchPlaceholder="Tìm kiếm sản phẩm..."
      />

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin sản phẩm vào form bên dưới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                defaultValue={editingProduct?.name}
                placeholder="VD: KidTrack Pro GPS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                defaultValue={editingProduct?.slug}
                placeholder="kidtrack-pro-gps"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Giá từ (VND)</Label>
              <Input
                id="price"
                type="number"
                defaultValue={editingProduct?.priceFrom}
                placeholder="1500000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                defaultValue={editingProduct?.description}
                placeholder="Mô tả sản phẩm..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

