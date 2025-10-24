"use client"

import { Label } from "@/components/ui/label"
import { COLOR_PALETTE } from "@/lib/constants"
import { useCustomizer } from "@/store/useCustomizer"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function ColorPicker() {
  const { colors, setColor } = useCustomizer()

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Màu dây đeo</Label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.id}
              onClick={() => setColor("band", color.id)}
              className={cn(
                "relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                colors.band === color.id
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-muted"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Chọn màu ${color.name} cho dây đeo`}
            >
              {colors.band === color.id && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-3 block">Màu mặt đồng hồ</Label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.id}
              onClick={() => setColor("face", color.id)}
              className={cn(
                "relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                colors.face === color.id
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-muted"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Chọn màu ${color.name} cho mặt đồng hồ`}
            >
              {colors.face === color.id && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-3 block">Màu viền</Label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color.id}
              onClick={() => setColor("rim", color.id)}
              className={cn(
                "relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                colors.rim === color.id
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-muted"
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Chọn màu ${color.name} cho viền`}
            >
              {colors.rim === color.id && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

