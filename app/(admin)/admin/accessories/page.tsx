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
import { Accessory } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null)
  const { toast } = useToast()

  // Fetch accessories
  useEffect(() => {
    fetch("/api/accessories")
      .then((res) => res.json())
      .then((data) => {
        setAccessories(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching accessories:", error)
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
      label: "Tên charm",
      sortable: true,
      render: (accessory: Accessory) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 text-2xl flex items-center justify-center bg-accent rounded">
            {accessory.icon}
          </div>
          <span className="font-medium">{accessory.name}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Giá",
      sortable: true,
      render: (accessory: Accessory) => (
        <span className="font-medium">
          {accessory.price.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "compatiblePositions",
      label: "Vị trí tương thích",
      render: (accessory: Accessory) => (
        <div className="flex gap-1 flex-wrap">
          {accessory.compatiblePositions.map((pos) => (
            <Badge key={pos} variant="secondary">
              {pos === "top" && "Trên"}
              {pos === "left" && "Trái"}
              {pos === "right" && "Phải"}
              {pos === "bottom" && "Dưới"}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (accessory: Accessory) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(accessory)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(accessory.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const handleEdit = (accessory: Accessory) => {
    setEditingAccessory(accessory)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa charm này?")) {
      setAccessories(accessories.filter((a) => a.id !== id))
      toast({
        title: "Đã xóa charm",
        description: "Charm đã được xóa thành công",
      })
    }
  }

  const handleSave = () => {
    setDialogOpen(false)
    setEditingAccessory(null)
    toast({
      title: "Đã lưu",
      description: "Charm đã được cập nhật thành công",
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
          <h1 className="text-3xl font-bold tracking-tight">Accessories (Charms)</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các charm và phụ kiện trang trí
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm charm
        </Button>
      </div>

      {/* Accessories Grid Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {accessories.slice(0, 12).map((accessory) => (
          <div
            key={accessory.id}
            className="p-4 border rounded-lg hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">{accessory.icon}</div>
            <p className="text-sm font-medium">{accessory.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {accessory.price.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        ))}
      </div>

      {/* Accessories Table */}
      <DataTable
        data={accessories}
        columns={columns}
        searchPlaceholder="Tìm kiếm charm..."
      />

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccessory ? "Chỉnh sửa charm" : "Thêm charm mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin charm vào form bên dưới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên charm</Label>
              <Input
                id="name"
                defaultValue={editingAccessory?.name}
                placeholder="VD: Ngôi sao"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input
                id="icon"
                defaultValue={editingAccessory?.icon}
                placeholder="⭐"
                className="text-2xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Giá (VND)</Label>
              <Input
                id="price"
                type="number"
                defaultValue={editingAccessory?.price}
                placeholder="30000"
              />
            </div>
            <div className="grid gap-2">
              <Label>Vị trí tương thích</Label>
              <div className="space-y-2">
                {["top", "left", "right", "bottom"].map((position) => (
                  <div key={position} className="flex items-center space-x-2">
                    <Checkbox
                      id={position}
                      defaultChecked={editingAccessory?.compatiblePositions.includes(
                        position as any
                      )}
                    />
                    <label
                      htmlFor={position}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {position === "top" && "Trên"}
                      {position === "left" && "Trái"}
                      {position === "right" && "Phải"}
                      {position === "bottom" && "Dưới"}
                    </label>
                  </div>
                ))}
              </div>
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

