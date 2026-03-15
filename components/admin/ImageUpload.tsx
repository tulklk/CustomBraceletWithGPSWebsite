"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Upload, Loader2 } from "lucide-react"
import { uploadImageToCloudinary, uploadMultipleImages } from "@/lib/cloudinary"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadItem {
  imageUrl: string
  type: number // 0 = Product, 1 = Illustration
}

interface ImageUploadProps {
  value: ImageUploadItem[]
  onChange: (items: ImageUploadItem[]) => void
  maxImages?: number
  multiple?: boolean
}

export function ImageUpload({ value = [], onChange, maxImages = 5, multiple = true }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validate number of images
    const totalImages = value.length + files.length
    if (totalImages > maxImages) {
      toast({
        title: "Lỗi",
        description: `Tối đa ${maxImages} ảnh. Bạn đã chọn quá giới hạn.`,
        variant: "destructive",
      })
      return
    }

    // Validate file sizes and types
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: `Ảnh "${file.name}" vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`,
          variant: "destructive",
        })
        continue
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Lỗi",
          description: `File "${file.name}" không phải là ảnh.`,
          variant: "destructive",
        })
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Upload files
    setUploading(true)
    try {
      const urls = multiple
        ? await uploadMultipleImages(validFiles)
        : [await uploadImageToCloudinary(validFiles[0]).then(r => r.secure_url)]

      const newItems: ImageUploadItem[] = urls.map(url => ({
        imageUrl: url,
        type: 0 // Default to Product
      }))

      const updatedValue = multiple ? [...value, ...newItems] : newItems
      onChange(updatedValue.slice(0, maxImages))

      toast({
        title: "Thành công",
        description: `Đã upload ${urls.length} ảnh thành công`,
      })
    } catch (error: any) {
      toast({
        title: "Lỗi upload",
        description: error.message || "Không thể upload ảnh",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index)
    onChange(newValue)
  }

  const toggleType = (index: number) => {
    const newValue = [...value]
    newValue[index] = {
      ...newValue[index],
      type: newValue[index].type === 0 ? 1 : 0
    }
    onChange(newValue)
  }

  return (
    <div className="space-y-4">
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || value.length >= maxImages}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              + Chọn ảnh từ máy tính
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Có thể chọn nhiều ảnh cùng lúc. Tối đa 5MB mỗi ảnh. Click vào ảnh để đổi loại (Hiển thị/Minh họa).
          {value.length > 0 && ` Đã chọn: ${value.length}/${maxImages} ảnh.`}
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((item, index) => (
            <div key={index} className="relative group">
              <div
                className={`relative aspect-square rounded-lg overflow-hidden bg-muted border-2 cursor-pointer transition-colors ${item.type === 0 ? "border-primary" : "border-amber-400"
                  }`}
                onClick={() => toggleType(index)}
                title="Click để đổi loại (Product/Illustration)"
              >
                <Image
                  src={item.imageUrl}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Type Badge */}
                <div className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] font-bold text-white text-center ${item.type === 0 ? "bg-primary/80" : "bg-amber-500/80"
                  }`}>
                  {item.type === 0 ? "SẢN PHẨM" : "MINH HỌA"}
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

