"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useUser } from "@/store/useUser"
import { adminApi } from "@/lib/api/admin"
import { AdminUser } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dayjs from "dayjs"
import "dayjs/locale/vi"
dayjs.locale("vi")

export default function UsersPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const normalizeStatus = (status?: string | null) => {
    const lower = (status || "").toLowerCase()
    if (lower === "hoạt động" || lower === "active") return "Hoạt động"
    return "Không hoạt động"
  }

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    role: "0",
    status: "Hoạt động",
  })

  useEffect(() => {
    if (!user?.accessToken) return
    fetchUsers()
  }, [user?.accessToken])

  const fetchUsers = async () => {
    if (!user?.accessToken) return
    try {
      setLoading(true)
      const data = await adminApi.users.getAll(user.accessToken)
      setUsers(data)
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách người dùng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (userItem?: AdminUser) => {
    if (userItem) {
      setEditingUser(userItem)
      setFormData({
        fullName: userItem.fullName || "",
        phoneNumber: userItem.phoneNumber || "",
        role: userItem.role.toString(),
        status: normalizeStatus(userItem.status),
      })
    } else {
      setEditingUser(null)
      setFormData({
        fullName: "",
        phoneNumber: "",
        role: "0",
        status: "Hoạt động",
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    setFormData({
      fullName: "",
      phoneNumber: "",
      role: "0",
      status: "Hoạt động",
    })
  }

  const handleSubmit = async () => {
    if (!user?.accessToken || !editingUser) return
    if (!formData.fullName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập họ tên",
        variant: "destructive",
      })
      return
    }

    try {
      const currentStatus = normalizeStatus(editingUser.status)
      const newStatus = normalizeStatus(formData.status)
      const statusChanged = currentStatus !== newStatus
      await adminApi.users.update(user.accessToken, editingUser.id, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber || null,
        role: parseInt(formData.role),
      })

      if (statusChanged) {
        await adminApi.users.updateStatus(user.accessToken, editingUser.id, newStatus)
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng",
      })
      handleCloseDialog()
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật người dùng",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!user?.accessToken) return
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return

    try {
      await adminApi.users.delete(user.accessToken, id)
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng",
      })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa người dùng",
        variant: "destructive",
      })
    }
  }

  const columns = [
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "fullName",
      label: "Họ tên",
      sortable: true,
    },
    {
      key: "phoneNumber",
      label: "Số điện thoại",
      render: (user: AdminUser) => user.phoneNumber || "N/A",
    },
    {
      key: "role",
      label: "Vai trò",
      // Backend: role = 1 => Admin, role = 0 => Khách hàng
      render: (user: AdminUser) => (
        <Badge variant={user.role === 1 ? "default" : "secondary"}>
          {user.role === 1 ? "Admin" : "Khách hàng"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (user: AdminUser) => {
        const statusLabel = normalizeStatus(user.status)
        const isActive = statusLabel === "Hoạt động"
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {statusLabel}
          </Badge>
        )
      },
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      sortable: true,
      render: (user: AdminUser) => {
        if (!user.createdAt) return "N/A"
        return dayjs(user.createdAt).format("DD [tháng] MM, YYYY")
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (userItem: AdminUser) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDialog(userItem)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(userItem.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const filteredUsers = users.filter((userItem) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      userItem.email.toLowerCase().includes(searchLower) ||
      userItem.fullName.toLowerCase().includes(searchLower) ||
      userItem.phoneNumber?.toLowerCase().includes(searchLower)
    )
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
      <div>
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>TÌM KIẾM NGƯỜI DÙNG</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Tìm theo email, họ tên hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={filteredUsers}
            columns={columns}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng trong hệ thống
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editingUser.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="0">Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Trạng thái hoạt động</p>
                    <p className="text-xs text-muted-foreground">
                      Bật để kích hoạt, tắt để vô hiệu hóa tài khoản
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.status === "Hoạt động"}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          status: checked ? "Hoạt động" : "Không hoạt động",
                        })
                      }
                    />
                    <Badge variant={formData.status === "Hoạt động" ? "default" : "destructive"}>
                      {formData.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

