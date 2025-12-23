"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminNews, AdminCategory } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import "dayjs/locale/vi"
dayjs.locale("vi")

export default function NewsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [news, setNews] = useState<AdminNews[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<AdminNews | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    imageUrl: "",
    categoryId: "",
    published: false,
  })

  useEffect(() => {
    if (!user?.accessToken) return
    fetchData()
  }, [user?.accessToken])

  const fetchData = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const [newsData, categoriesData] = await Promise.all([
        adminApi.news.getAll(user.accessToken),
        adminApi.categories.getAll(user.accessToken),
      ])
      setNews(newsData)
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

  const handleOpenDialog = (newsItem?: AdminNews) => {
    if (newsItem) {
      setEditingNews(newsItem)
      setFormData({
        title: newsItem.title || "",
        content: newsItem.content || "",
        summary: newsItem.summary || "",
        imageUrl: newsItem.imageUrl || "",
        categoryId: newsItem.categoryId || "",
        published: newsItem.published || false,
      })
    } else {
      setEditingNews(null)
      setFormData({
        title: "",
        content: "",
        summary: "",
        imageUrl: "",
        categoryId: "",
        published: false,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingNews(null)
    setFormData({
      title: "",
      content: "",
      summary: "",
      imageUrl: "",
      categoryId: "",
      published: false,
    })
  }

  const handleSubmit = async () => {
    if (!user?.accessToken) return
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    try {
      const newsData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || null,
        imageUrl: formData.imageUrl || null,
        categoryId: formData.categoryId || null,
        published: formData.published,
      }

      if (editingNews) {
        await adminApi.news.update(user.accessToken, editingNews.id, newsData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật tin tức",
        })
      } else {
        await adminApi.news.create(user.accessToken, newsData)
        toast({
          title: "Thành công",
          description: "Đã tạo tin tức mới",
        })
      }
      handleCloseDialog()
      fetchData()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu tin tức",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!user?.accessToken) return
    if (!confirm("Bạn có chắc chắn muốn xóa tin tức này?")) return

    try {
      await adminApi.news.delete(user.accessToken, id)
      toast({
        title: "Thành công",
        description: "Đã xóa tin tức",
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tin tức",
        variant: "destructive",
      })
    }
  }

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || item.categoryId === categoryFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && item.published) ||
      (statusFilter === "draft" && !item.published)
    return matchesSearch && matchesCategory && matchesStatus
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
          <h1 className="text-3xl font-bold">Quản lý tin tức</h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các bài viết tin tức cho website
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo tin tức mới
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm tin tức</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Danh mục</Label>
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
            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="published">Đã publish</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "Không tìm thấy tin tức nào"
              : "Chưa có tin tức nào"}
          </div>
        ) : (
          filteredNews.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.imageUrl && (
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={item.published ? "default" : "secondary"}>
                    {item.published ? "Đã publish" : "Bản nháp"}
                  </Badge>
                  {item.categoryId && (
                    <Badge variant="outline">
                      {categories.find((c) => c.id === item.categoryId)?.name || "Không có"}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                {item.summary && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {item.summary}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>
                    {item.createdAt
                      ? dayjs(item.createdAt).format("DD [tháng] MM, YYYY")
                      : "N/A"}
                  </span>
                  {item.views !== undefined && (
                    <span>{item.views} lượt xem</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? "Sửa tin tức" : "Tạo tin tức mới"}
            </DialogTitle>
            <DialogDescription>
              {editingNews
                ? "Cập nhật thông tin tin tức"
                : "Tạo bài viết tin tức mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Tóm tắt</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Nhập tóm tắt"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập nội dung"
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL hình ảnh</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không có danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="published">Trạng thái</Label>
                <Select
                  value={formData.published ? "published" : "draft"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, published: value === "published" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Đã publish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingNews ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

