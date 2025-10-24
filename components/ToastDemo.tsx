"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ToastDemo() {
  const { toast } = useToast()

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="default"
        onClick={() => {
          toast({
            title: "Đã thêm vào giỏ hàng! 🎉",
            description: "Sản phẩm đã được thêm thành công",
          })
        }}
      >
        Success Toast
      </Button>

      <Button
        variant="destructive"
        onClick={() => {
          toast({
            variant: "destructive",
            title: "Có lỗi xảy ra!",
            description: "Vui lòng thử lại sau",
          })
        }}
      >
        Error Toast
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: "Đã đạt giới hạn",
            description: "Tối đa 12 charm trên vòng tay",
          })
        }}
      >
        Warning Toast
      </Button>

      <Button
        variant="secondary"
        onClick={() => {
          toast({
            title: "Đã lưu thiết kế! ✨",
            description: "Xem trong 'Thiết kế của tôi'",
          })
        }}
      >
        Info Toast
      </Button>
    </div>
  )
}

