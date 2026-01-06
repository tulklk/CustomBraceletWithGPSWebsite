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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, Upload, Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminNews, CreateNewsRequest } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { slugify } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
dayjs.locale("vi")

export default function NewsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [news, setNews] = useState<AdminNews[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<AdminNews | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState<CreateNewsRequest>({
    title: "",
    content: "",
    summary: "",
    thumbnailUrl: "",
    category: "",
    tags: "",
    isPublished: false,
  })
  const [previewSlug, setPreviewSlug] = useState("")
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user?.accessToken) return
    fetchData()
  }, [user?.accessToken])

  // Generate slug preview from title
  useEffect(() => {
    if (formData.title) {
      setPreviewSlug(slugify(formData.title))
    } else {
      setPreviewSlug("")
    }
  }, [formData.title])

  const fetchData = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const newsData = await adminApi.news.getAll(user.accessToken)
      setNews(newsData)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      if (error.statusCode === 401 || error.statusCode === 403) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        })
      } else {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải dữ liệu",
        variant: "destructive",
      })
      }
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
        thumbnailUrl: newsItem.thumbnailUrl || "",
        category: newsItem.category || "",
        tags: newsItem.tags || "",
        isPublished: newsItem.isPublished || false,
      })
      setPreviewSlug(newsItem.slug || "")
    } else {
      setEditingNews(null)
      setFormData({
        title: "",
        content: "",
        summary: "",
        thumbnailUrl: "",
        category: "",
        tags: "",
        isPublished: false,
      })
      setPreviewSlug("")
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
      thumbnailUrl: "",
      category: "",
      tags: "",
      isPublished: false,
    })
    setPreviewSlug("")
  }

  const handleSubmit = async () => {
    if (!user?.accessToken) return
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề và Nội dung)",
        variant: "destructive",
      })
      return
    }

    try {
      const newsData: CreateNewsRequest = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        summary: formData.summary?.trim() || null,
        thumbnailUrl: formData.thumbnailUrl?.trim() || null,
        category: formData.category?.trim() || null,
        tags: formData.tags?.trim() || null,
        isPublished: formData.isPublished,
      }

      if (editingNews) {
        await adminApi.news.update(user.accessToken, editingNews.id, newsData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật tin tức",
        })
      } else {
        const result = await adminApi.news.create(user.accessToken, newsData)
        toast({
          title: "Thành công",
          description: `Đã tạo tin tức mới với slug: ${result.slug}`,
        })
      }
      handleCloseDialog()
      fetchData()
    } catch (error: any) {
      console.error("Error saving news:", error)
      if (error.statusCode === 401 || error.statusCode === 403) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        })
      } else {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu tin tức",
        variant: "destructive",
      })
      }
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
      console.error("Error deleting news:", error)
      if (error.statusCode === 401 || error.statusCode === 403) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        })
      } else {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tin tức",
        variant: "destructive",
      })
    }
  }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước ảnh phải nhỏ hơn 5MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "File phải là ảnh",
        variant: "destructive",
      })
      return
    }

    setUploadingThumbnail(true)
    try {
      const result = await uploadImageToCloudinary(file)
      setFormData({ ...formData, thumbnailUrl: result.secure_url })
      toast({
        title: "Thành công",
        description: "Đã upload ảnh thành công",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi upload",
        description: error.message || "Không thể upload ảnh",
        variant: "destructive",
      })
    } finally {
      setUploadingThumbnail(false)
      // Reset input
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = ""
      }
    }
  }

  const handleRemoveThumbnail = () => {
    setFormData({ ...formData, thumbnailUrl: "" })
  }

  // Get unique categories from news
  const categories = Array.from(new Set(news.map((item) => item.category).filter(Boolean))) as string[]

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && item.isPublished) ||
      (statusFilter === "unpublished" && !item.isPublished)
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
            placeholder="Tìm kiếm theo tiêu đề, tóm tắt, nội dung..."
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
                    <SelectItem key={category} value={category}>
                      {category}
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
                  <SelectItem value="unpublished">Chưa publish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tin tức ({filteredNews.length})</CardTitle>
        </CardHeader>
        <CardContent>
        {filteredNews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "Không tìm thấy tin tức nào"
              : "Chưa có tin tức nào"}
          </div>
        ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Lượt xem</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="line-clamp-2">{item.title}</div>
                      </TableCell>
                      <TableCell>
                        {item.category ? (
                          <Badge variant="outline">{item.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
              )}
                      </TableCell>
                      <TableCell>
                        {item.authorName || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isPublished ? "default" : "secondary"}>
                          {item.isPublished ? "Đã publish" : "Chưa publish"}
                  </Badge>
                      </TableCell>
                      <TableCell>{item.viewCount || 0}</TableCell>
                      <TableCell>
                    {item.createdAt
                          ? dayjs(item.createdAt).format("DD/MM/YYYY")
                      : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.isPublished && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/news/${item.slug}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </Link>
                  </Button>
                          )}
                  <Button
                            variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(item)}
                  >
                            <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                            variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                            <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
              </CardContent>
            </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            
            {/* Slug Preview */}
            {previewSlug && (
              <div className="space-y-2">
                <Label>Slug (tự động tạo)</Label>
                <Input
                  value={previewSlug}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  URL sẽ là: /news/{previewSlug}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="summary">Tóm tắt</Label>
              <Textarea
                id="summary"
                value={formData.summary || ""}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Nhập tóm tắt (tùy chọn)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung *</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Nhập nội dung..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Hình ảnh thumbnail</Label>
              
              {/* Upload Button */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="flex-1"
                >
                  {uploadingThumbnail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload ảnh từ máy tính
                    </>
                  )}
                </Button>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
              />
            </div>
              
              {/* Preview */}
              {formData.thumbnailUrl && (
                <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-muted border-2 border-border">
                  <Image
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleRemoveThumbnail}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Kích thước tối đa: 5MB. Khuyến nghị: ảnh ngang (16:9) để hiển thị đẹp nhất.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Input
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ví dụ: Tin tức, Hướng dẫn, Khuyến mãi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags || ""}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ví dụ: tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked === true })
                }
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Đã publish (hiển thị cho người dùng)
              </Label>
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
