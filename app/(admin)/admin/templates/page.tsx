"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
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
import { Template } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const { toast } = useToast()

  // Fetch templates
  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching templates:", error)
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
      label: "Tên template",
      sortable: true,
      render: (template: Template) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded border flex items-center justify-center"
            style={{ background: template.defaultColors.band }}
          >
            <div
              className="w-6 h-6 rounded-full border-2"
              style={{ 
                borderColor: template.defaultColors.rim,
                background: template.defaultColors.face 
              }}
            />
          </div>
          <span className="font-medium">{template.name}</span>
        </div>
      ),
    },
    {
      key: "basePrice",
      label: "Giá cơ bản",
      sortable: true,
      render: (template: Template) => (
        <span className="font-medium">
          {template.basePrice.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "defaultColors",
      label: "Màu sắc mặc định",
      render: (template: Template) => (
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border"
              style={{ background: template.defaultColors.band }}
            />
            <span className="text-xs text-muted-foreground">Dây</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border"
              style={{ background: template.defaultColors.face }}
            />
            <span className="text-xs text-muted-foreground">Mặt</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border"
              style={{ background: template.defaultColors.rim }}
            />
            <span className="text-xs text-muted-foreground">Viền</span>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (template: Template) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(template)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(template.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa template này?")) {
      setTemplates(templates.filter((t) => t.id !== id))
      toast({
        title: "Đã xóa template",
        description: "Template đã được xóa thành công",
      })
    }
  }

  const handleSave = () => {
    setDialogOpen(false)
    setEditingTemplate(null)
    toast({
      title: "Đã lưu",
      description: "Template đã được cập nhật thành công",
    })
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các mẫu thiết kế vòng tay
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm template
        </Button>
      </div>

      {/* Templates Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {templates.slice(0, 6).map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{template.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div 
                className="w-full h-32 rounded-lg border-4 flex items-center justify-center mb-3"
                style={{ 
                  borderColor: template.defaultColors.band,
                  background: `linear-gradient(135deg, ${template.defaultColors.face} 0%, ${template.defaultColors.rim} 100%)`
                }}
              >
                <div 
                  className="w-20 h-20 rounded-full border-4"
                  style={{ 
                    borderColor: template.defaultColors.rim,
                    background: template.defaultColors.face 
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {template.description || "Không có mô tả"}
              </p>
              <p className="font-semibold text-lg">
                {template.basePrice.toLocaleString("vi-VN")} ₫
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Templates Table */}
      <DataTable
        data={templates}
        columns={columns}
        searchPlaceholder="Tìm kiếm template..."
      />

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Chỉnh sửa template" : "Thêm template mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin template vào form bên dưới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên template</Label>
              <Input
                id="name"
                defaultValue={editingTemplate?.name}
                placeholder="VD: Rainbow Dream"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="basePrice">Giá cơ bản (VND)</Label>
              <Input
                id="basePrice"
                type="number"
                defaultValue={editingTemplate?.basePrice}
                placeholder="500000"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bandColor">Màu dây</Label>
                <Input
                  id="bandColor"
                  type="color"
                  defaultValue={editingTemplate?.defaultColors.band}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="faceColor">Màu mặt</Label>
                <Input
                  id="faceColor"
                  type="color"
                  defaultValue={editingTemplate?.defaultColors.face}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rimColor">Màu viền</Label>
                <Input
                  id="rimColor"
                  type="color"
                  defaultValue={editingTemplate?.defaultColors.rim}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                defaultValue={editingTemplate?.description}
                placeholder="Mô tả template..."
                rows={3}
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

