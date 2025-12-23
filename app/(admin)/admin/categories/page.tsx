"use client"

import { useState, useEffect, useCallback } from "react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, X } from "lucide-react"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminCategory } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { slugify } from "@/lib/utils"

export default function CategoriesPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subcategories: [] as Array<{ name: string; description: string }>,
  })

  const fetchCategories = useCallback(async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const data = await adminApi.categories.getAll(user.accessToken)
      setCategories(data)
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh mục",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user?.accessToken, toast])

  useEffect(() => {
    if (!user?.accessToken) return
    fetchCategories()
  }, [user?.accessToken, fetchCategories])

  const handleOpenDialog = (category?: AdminCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name || "",
        description: category.description || "",
        subcategories: [],
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: "",
        description: "",
        subcategories: [],
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      subcategories: [],
    })
  }

  const handleAddSubcategory = () => {
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, { name: "", description: "" }],
    })
  }

  const handleRemoveSubcategory = (index: number) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((_, i) => i !== index),
    })
  }

  const handleSubcategoryChange = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const updatedSubcategories = [...formData.subcategories]
    updatedSubcategories[index][field] = value
    setFormData({
      ...formData,
      subcategories: updatedSubcategories,
    })
  }

  const handleSubmit = async () => {
    if (!user?.accessToken) return
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên danh mục cha",
        variant: "destructive",
      })
      return
    }

    // Validate subcategories
    for (let i = 0; i < formData.subcategories.length; i++) {
      if (!formData.subcategories[i].name.trim()) {
        toast({
          title: "Lỗi",
          description: `Vui lòng nhập tên cho danh mục con ${i + 1}`,
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (editingCategory) {
        // Edit mode: only update the category itself
        const slug = slugify(formData.name.trim())
        const categoryData = {
          name: formData.name.trim(),
          slug: slug,
          parentId: null,
        }
        await adminApi.categories.update(user.accessToken, editingCategory.id, categoryData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật danh mục",
        })
      } else {
        // Create mode: create parent category first, then subcategories
        const slug = slugify(formData.name.trim())
        const parentCategoryData = {
          name: formData.name.trim(),
          slug: slug,
          parentId: null,
        }

        // Create parent category
        const parentCategory = await adminApi.categories.create(
          user.accessToken,
          parentCategoryData
        )

        // Create subcategories if any
        if (formData.subcategories.length > 0) {
          const subcategoryPromises = formData.subcategories.map((sub) => {
            const subSlug = slugify(sub.name.trim())
            return adminApi.categories.create(user.accessToken, {
              name: sub.name.trim(),
              slug: subSlug,
              parentId: parentCategory.id,
            })
          })
          await Promise.all(subcategoryPromises)
        }

        const subcategoryCount = formData.subcategories.length
        toast({
          title: "Thành công",
          description: `Đã tạo danh mục cha${subcategoryCount > 0 ? ` và ${subcategoryCount} danh mục con` : ""}`,
        })
      }
      
      // Close dialog first with smooth transition
      handleCloseDialog()
      
      // Then refresh categories list
      await fetchCategories()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu danh mục",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user?.accessToken) return
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return

    try {
      await adminApi.categories.delete(user.accessToken, id)
      toast({
        title: "Thành công",
        description: "Đã xóa danh mục",
      })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa danh mục",
        variant: "destructive",
      })
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate subcategory count for each category
  const getSubcategoryCount = (categoryId: string) => {
    return categories.filter((cat) => cat.parentId === categoryId).length
  }

  // Get only parent categories (categories without parentId) for display
  const parentCategories = filteredCategories.filter((cat) => !cat.parentId)

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
          <h1 className="text-3xl font-bold">Danh mục</h1>
          <p className="text-muted-foreground mt-1">
            Tất cả danh mục - Quản lý danh mục sản phẩm (danh mục gốc và danh mục con)
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Tìm theo tên hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục ({parentCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {parentCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-pink-50 hover:bg-pink-50">
                  <TableHead className="font-semibold">Tên</TableHead>
                  <TableHead className="font-semibold">Mô tả</TableHead>
                  <TableHead className="text-right font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parentCategories.map((category) => {
                  const subcategoryCount = getSubcategoryCount(category.id)
                  const displayName = subcategoryCount > 0 
                    ? `> ${category.name} (${subcategoryCount} danh mục)`
                    : category.name
                  const displayDescription = category.description?.trim() || "Không có mô tả"
                  
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{displayName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {displayDescription}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !isSubmitting && setDialogOpen(open)}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-2">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {editingCategory ? "Đang cập nhật danh mục..." : "Đang tạo danh mục..."}
                </p>
              </div>
            </div>
          )}
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Sửa danh mục" : "Tạo danh mục mới"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Cập nhật thông tin danh mục"
                : "Tạo danh mục sản phẩm mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Parent Category Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Thông tin danh mục cha & danh mục con</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục cha *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Vợt Pickleball"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả danh mục cha</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về danh mục này..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Subcategories Section */}
            {!editingCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Danh mục con (tuỳ chọn)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubcategory}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm danh mục con
                  </Button>
                </div>

                {formData.subcategories.length > 0 && (
                  <div className="space-y-4">
                    {formData.subcategories.map((subcategory, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-base">
                            Tên danh mục con {index + 1} *
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveSubcategory(index)}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <Input
                          value={subcategory.name}
                          onChange={(e) =>
                            handleSubcategoryChange(index, "name", e.target.value)
                          }
                          placeholder={`Tên danh mục con ${index + 1}`}
                          disabled={isSubmitting}
                        />

                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            Mô tả danh mục con (tuỳ chọn)
                          </Label>
                          <Textarea
                            value={subcategory.description}
                            onChange={(e) =>
                              handleSubcategoryChange(index, "description", e.target.value)
                            }
                            placeholder="Mô tả về danh mục con này..."
                            rows={2}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.subcategories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Ví dụ: danh mục cha &quot;Vợt Pickleball&quot; có các danh mục con như &quot;Vợt Pickleball
                    Joola&quot;, &quot;Vợt Pickleball Franklin&quot;...
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  {editingCategory ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                editingCategory ? "Cập nhật" : "Tạo danh mục"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

