"use client"

import { useCustomizer } from "@/store/useCustomizer"
import { COLOR_PALETTE } from "@/lib/constants"
import { Accessory } from "@/lib/types"

interface CanvasProps {
  accessories: Accessory[]
}

export function Canvas({ accessories }: CanvasProps) {
  const { colors, accessories: selectedAccessories, engrave } = useCustomizer()

  const getColorHex = (colorId: string) => {
    return COLOR_PALETTE.find((c) => c.id === colorId)?.hex || "#000"
  }

  const getAccessoryById = (id: string) => {
    return accessories.find((a) => a.id === id)
  }

  // Tính toán vị trí của accessories dọc theo dây
  const getBandPositions = () => {
    const positions = []
    const totalSlots = 12 // 12 vị trí dọc theo dây
    for (let i = 0; i < totalSlots; i++) {
      const x = 50 + (i * 700) / (totalSlots - 1) // Phân bố đều từ trái sang phải
      const y = 150 // Ở giữa theo chiều dọc
      positions.push({ x, y, index: i })
    }
    return positions
  }

  const bandPositions = getBandPositions()

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-1">KÍCH THƯỚC SẢN PHẨM</h3>
        <p className="text-sm text-muted-foreground">
          Thiết kế mới: bản dây nhỏ hơn, dây mỏng nhẹ hơn
        </p>
      </div>

      {/* Watch band preview - Horizontal thin band */}
      <div className="relative w-full" style={{ height: "300px" }}>
        <svg
          viewBox="0 0 800 300"
          className="w-full h-full"
          aria-label="Preview vòng tay"
        >
          {/* Band shadow */}
          <rect
            x="40"
            y="148"
            width="720"
            height="34"
            rx="17"
            fill="black"
            opacity="0.1"
          />

          {/* Main band - thin horizontal strap */}
          <rect
            x="40"
            y="145"
            width="720"
            height="30"
            rx="15"
            fill={getColorHex(colors.band)}
            stroke={getColorHex(colors.rim)}
            strokeWidth="1"
          />

          {/* Band holes pattern (decorative) */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <circle
              key={i}
              cx={50 + i * 60}
              cy={160}
              r="2"
              fill="white"
              opacity="0.3"
            />
          ))}

          {/* Watch face - centered larger circle */}
          <circle
            cx="400"
            cy="160"
            r="55"
            fill={getColorHex(colors.face)}
            stroke={getColorHex(colors.rim)}
            strokeWidth="3"
          />

          {/* Inner rim */}
          <circle
            cx="400"
            cy="160"
            r="50"
            fill="transparent"
            stroke={getColorHex(colors.rim)}
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* Display area */}
          <rect
            x="385"
            y="145"
            width="30"
            height="15"
            rx="2"
            fill="#1a1a1a"
            opacity="0.2"
          />

          {/* Button (right side) */}
          <circle
            cx="740"
            cy="160"
            r="12"
            fill="#cccccc"
            stroke="#999"
            strokeWidth="1"
          />
          <circle cx="740" cy="160" r="8" fill="#e0e0e0" />

          {/* Buckle (left side) */}
          <rect
            x="50"
            y="150"
            width="12"
            height="20"
            rx="2"
            fill="#b0b0b0"
            stroke="#888"
            strokeWidth="1"
          />

          {/* Accessories/Charms dọc theo dây */}
          {selectedAccessories.slice(0, 12).map((acc, index) => {
            const accessory = getAccessoryById(acc.accessoryId)
            if (!accessory) return null

            // Vị trí cách đều dọc theo dây, tránh mặt đồng hồ
            let posX
            if (index < 6) {
              // Bên trái mặt đồng hồ
              posX = 80 + index * 45
            } else {
              // Bên phải mặt đồng hồ
              posX = 480 + (index - 6) * 45
            }

            const posY = 160 + (index % 2 === 0 ? -35 : 35) // Xen kẽ trên dưới

            return (
              <g key={`${acc.accessoryId}-${index}`}>
                {/* Charm background circle */}
                <circle
                  cx={posX}
                  cy={posY}
                  r="18"
                  fill="white"
                  stroke={getColorHex(colors.rim)}
                  strokeWidth="1.5"
                />
                {/* Emoji/Icon */}
                <text
                  x={posX}
                  y={posY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="24"
                >
                  {accessory.icon}
                </text>
              </g>
            )
          })}

          {/* Engrave text on band */}
          {engrave && (
            <text
              x="400"
              y="160"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill={colors.face === "white" ? "#333" : "#fff"}
              fontFamily={
                engrave.font === "Rounded"
                  ? "ui-rounded, system-ui"
                  : engrave.font === "Mono"
                  ? "ui-monospace, monospace"
                  : "ui-sans-serif, system-ui"
              }
              fontWeight="600"
            >
              {engrave.text}
            </text>
          )}
        </svg>

        {/* Dimensions labels */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 flex items-center gap-2">
          <div className="h-px w-8 bg-gray-400"></div>
          <span className="text-xs font-semibold px-2 py-1 bg-white rounded shadow-sm">
            Chiều dài 23 cm
          </span>
          <div className="h-px w-8 bg-gray-400"></div>
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gray-400"></div>
          <span className="text-xs font-semibold px-1 py-2 bg-white rounded shadow-sm writing-mode-vertical">
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
        <p className="font-medium">Live Preview</p>
      </div>
    </div>
  )
}

