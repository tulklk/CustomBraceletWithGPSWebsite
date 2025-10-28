"use client"

import { useCustomizer } from "@/store/useCustomizer"
import { COLOR_PALETTE } from "@/lib/constants"
import { Accessory } from "@/lib/types"
import Image from "next/image"

interface CanvasProps {
  accessories: Accessory[]
}

export function Canvas({ accessories }: CanvasProps) {
  const { templateId, colors, accessories: selectedAccessories, engrave } = useCustomizer()

  const getColorHex = (colorId: string) => {
    return COLOR_PALETTE.find((c) => c.id === colorId)?.hex || "#000"
  }

  const getAccessoryById = (id: string) => {
    return accessories.find((a) => a.id === id)
  }

  // Map template ID to image path
  const getImagePath = (id: string | null) => {
    if (!id) return '/images/templates/bunny-baby-pink.png'
    
    const imageMap: Record<string, string> = {
      'bunny-baby-pink': '/images/templates/bunny-baby-pink.png',
      'bunny-lavender': '/images/templates/bunny-lavender.png',
      'bunny-yellow': '/images/templates/bunny-yellow.png',
      'bunny-mint': '/images/templates/bunny-mint.png',
      'bunny-pink': '/images/templates/bunny-pink.png',
    }
    return imageMap[id] || imageMap['bunny-baby-pink']
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-1">KÍCH THƯỚC SẢN PHẨM</h3>
        <p className="text-sm text-muted-foreground">
          Thiết kế mới: bản dây nhỏ hơn, dây mỏng nhẹ hơn
        </p>
      </div>

      {/* Watch band preview - Real PNG Image */}
      <div className="relative w-full flex items-center justify-center" style={{ height: "400px" }}>
        {/* Main bracelet image */}
        <div className="relative w-full h-full max-w-2xl">
          <Image
            src={getImagePath(templateId)}
            alt="Bunny Bracelet"
            fill
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* Accessories overlay (floating charms around the watch) */}
        {selectedAccessories.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 800 400"
              className="w-full h-full max-w-2xl"
              aria-label="Accessories overlay"
            >
              {selectedAccessories.slice(0, 8).map((acc, index) => {
                const accessory = getAccessoryById(acc.accessoryId)
                if (!accessory) return null

                // Position charms around the watch face in a circle
                const angle = (index * 360) / Math.min(selectedAccessories.length, 8)
                const radius = 120
                const centerX = 400
                const centerY = 200
                
                const posX = centerX + radius * Math.cos((angle * Math.PI) / 180)
                const posY = centerY + radius * Math.sin((angle * Math.PI) / 180)

                return (
                  <g key={`${acc.accessoryId}-${index}`}>
                    {/* Charm background circle with glow */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r="22"
                      fill="white"
                      opacity="0.95"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                    />
                    <circle
                      cx={posX}
                      cy={posY}
                      r="20"
                      fill="white"
                      stroke={getColorHex(colors.rim)}
                      strokeWidth="2"
                    />
                    {/* Emoji/Icon */}
                    <text
                      x={posX}
                      y={posY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="28"
                    >
                      {accessory.icon}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        {/* Engrave text overlay on watch face */}
        {engrave && engrave.text && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-xs font-semibold"
              style={{
                fontFamily:
                  engrave.font === "Rounded"
                    ? "ui-rounded, system-ui"
                    : engrave.font === "Mono"
                    ? "ui-monospace, monospace"
                    : "ui-sans-serif, system-ui",
              }}
            >
              {engrave.text}
            </div>
          </div>
        )}

        {/* Dimensions labels */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 flex items-center gap-2">
          <div className="h-px w-8 bg-gray-400"></div>
          <span className="text-xs font-semibold px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-sm">
            Chiều dài 23 cm
          </span>
          <div className="h-px w-8 bg-gray-400"></div>
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gray-400"></div>
          <span className="text-xs font-semibold px-1 py-2 bg-white dark:bg-gray-800 rounded shadow-sm writing-mode-vertical">
            1.5 cm
          </span>
          <div className="w-px h-6 bg-gray-400"></div>
        </div>
      </div>

      {/* Design indicator */}
      <div className="mt-6 flex justify-center gap-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
          <span className="text-sm font-medium">
            Thiết kế mới: bản dây nhỏ hơn, dây mỏng nhẹ hơn
          </span>
        </div>
      </div>

      {/* Info label */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-md text-xs">
        <p className="font-medium">2D Preview</p>
      </div>
    </div>
  )
}

