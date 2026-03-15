"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getEngravingInfo, validateEngravingText } from "@/lib/api/engraving"
import { EngravingInfo } from "@/lib/types/engraving"
import { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface EngravingSectionProps {
  product: Product // Cần product để check hasEngraving
  value: string
  onChange: (value: string) => void
  className?: string
  error?: string | null // Error được truyền từ parent component
  onValidationChange?: (isValid: boolean, errorMessage: string | null) => void // Callback khi validation thay đổi
  onIllustrationClick?: () => void // Callback when illustration button is clicked
}

export default function EngravingSection({
  product,
  value,
  onChange,
  className = "",
  error: externalError = null,
  onValidationChange,
  onIllustrationClick,
}: EngravingSectionProps) {
  const [engravingInfo, setEngravingInfo] = useState<EngravingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const { toast } = useToast()

  // Use internal error if provided, otherwise use external error
  const displayError = internalError || externalError

  // Pre-fill default engraving text if product has it
  useEffect(() => {
    if (product.hasEngraving && product.defaultEngravingText && !value) {
      onChange(product.defaultEngravingText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.hasEngraving, product.defaultEngravingText]) // Only run when product changes

  // Fetch engraving info on mount
  useEffect(() => {
    const fetchEngravingInfo = async () => {
      try {
        const info = await getEngravingInfo()
        setEngravingInfo(info)
      } catch (error) {
        console.error("Failed to load engraving info", error)
        // Use default values on error
        setEngravingInfo({
          isFree: true,
          maxLength: 12,
          allowedCharacters: "A-Z, 0-9, khoảng trắng, dấu gạch (-)",
          description: "Khắc tên (tùy chọn)",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEngravingInfo()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.toUpperCase() // Auto uppercase

    // Limit to max length
    const maxLength = engravingInfo?.maxLength || 12
    if (newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength)
    }

    // Update value immediately (synchronous) - this is critical for input to work
    onChange(newValue)

    // Clear internal error when user starts typing
    if (internalError) {
      setInternalError(null)
      if (onValidationChange) {
        onValidationChange(true, null)
      }
    }
  }

  const handleSave = async () => {
    // Clear previous errors
    setInternalError(null)

    // If empty, just clear error and return success
    if (!value.trim()) {
      toast({
        title: "Lưu nội dung thành công",
        description: "Nội dung khắc tên đã được lưu",
      })
      if (onValidationChange) {
        onValidationChange(true, null)
      }
      return
    }

    setIsValidating(true)
    try {
      const result = await validateEngravingText(value.trim())

      if (!result.isValid) {
        const errorMessage = result.errorMessage || "Nội dung khắc không hợp lệ"
        setInternalError(errorMessage)
        if (onValidationChange) {
          onValidationChange(false, errorMessage)
        }
      } else {
        setInternalError(null)
        toast({
          title: "Lưu nội dung thành công",
          description: "Nội dung khắc tên đã được lưu",
        })
        if (onValidationChange) {
          onValidationChange(true, null)
        }
      }
    } catch (err) {
      console.error("Validation error", err)
      const errorMessage = "Không thể validate nội dung khắc"
      setInternalError(errorMessage)
      if (onValidationChange) {
        onValidationChange(false, errorMessage)
      }
    } finally {
      setIsValidating(false)
    }
  }

  // Không hiển thị section nếu product không hỗ trợ engraving
  if (!product.hasEngraving) {
    return null
  }

  // Always render something, even when loading or if info failed to load
  // Use default values if info is not available
  const displayInfo = engravingInfo || {
    isFree: true,
    maxLength: 12,
    allowedCharacters: "A-Z, 0-9, khoảng trắng, dấu gạch (-)",
    description: "Khắc tên (tùy chọn)",
  }

  if (isLoading) {
    return (
      <div className={`engraving-section space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold">Khắc tên (tùy chọn)</h3>
          <Badge variant="default" className="bg-pink-500 hover:bg-pink-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
            Miễn phí
          </Badge>
        </div>
        {onIllustrationClick && (
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onIllustrationClick}
              className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-colors"
            >
              hình ảnh minh họa
            </button>
            <span className="text-[10px] sm:text-xs text-muted-foreground animate-pulse">
              {"<-- bấm vào để xem ảnh"}
            </span>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="engraving-text" className="text-sm font-medium">
            Nội dung khắc ({value.length}/{displayInfo.maxLength})
          </Label>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <p className="text-xs text-muted-foreground">
            Chỉ cho phép: {displayInfo.allowedCharacters}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`engraving-section space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">{displayInfo.description}</h3>
        {displayInfo.isFree && (
          <Badge variant="default" className="bg-pink-500 hover:bg-pink-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
            Miễn phí
          </Badge>
        )}
      </div>

      {onIllustrationClick && (
        <div className="mt-[-8px] flex items-center gap-2">
          <button
            type="button"
            onClick={onIllustrationClick}
            className="bg-pink-500 hover:bg-pink-600 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
          >
            hình ảnh minh họa
          </button>
          <span className="text-[10px] sm:text-xs text-muted-foreground animate-pulse">
            {"<-- bấm vào để xem ảnh"}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="engraving-text" className="text-sm font-medium">
          Nội dung khắc ({value.length}/{displayInfo.maxLength})
        </Label>

        <div className="flex gap-2">
          <Input
            id="engraving-text"
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={product.defaultEngravingText || "VD: KIDTRACK"}
            maxLength={displayInfo.maxLength}
            className={`
              uppercase flex-1
              ${displayError ? "border-red-500 focus:ring-red-500" : "focus:ring-pink-500 focus:border-pink-500"}
            `}
          />
          <Button
            type="button"
            onClick={handleSave}
            disabled={isValidating}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6"
          >
            {isValidating ? "Đang kiểm tra..." : "Lưu"}
          </Button>
        </div>

        {displayError && (
          <p className="text-sm text-red-500">
            {displayError}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Chỉ cho phép: {displayInfo.allowedCharacters}
        </p>
      </div>
    </div>
  )
}

