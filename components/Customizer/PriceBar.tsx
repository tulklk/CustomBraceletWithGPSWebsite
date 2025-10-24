"use client"

import { useCustomizer } from "@/store/useCustomizer"
import { formatCurrency } from "@/lib/utils"
import { ENGRAVE_FEE } from "@/lib/constants"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface PriceBarProps {
  accessories: { id: string; name: string; price: number }[]
}

export function PriceBar({ accessories }: PriceBarProps) {
  const {
    basePrice,
    accessories: selectedAccessories,
    engrave,
    getUnitPrice,
    accessoriesPrices,
  } = useCustomizer()

  const accessoriesTotal = selectedAccessories.reduce(
    (sum, acc) => sum + (accessoriesPrices[acc.accessoryId] || 0),
    0
  )

  const engravePrice = engrave ? ENGRAVE_FEE : 0
  const total = getUnitPrice()

  return (
    <div
      className="p-4 bg-muted/50 rounded-lg space-y-3"
      role="region"
      aria-label="Chi tiết giá"
      aria-live="polite"
    >
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Giá cơ bản:</span>
        <span className="font-medium">{formatCurrency(basePrice)}</span>
      </div>

      {selectedAccessories.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">
                  Phụ kiện ({selectedAccessories.length}):
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {selectedAccessories.map((acc) => {
                        const accessory = accessories.find((a) => a.id === acc.accessoryId)
                        return (
                          <div key={acc.accessoryId} className="text-xs">
                            {accessory?.name}: {formatCurrency(accessory?.price || 0)}
                          </div>
                        )
                      })}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-medium">{formatCurrency(accessoriesTotal)}</span>
            </div>
          </div>
        </>
      )}

      {engrave && (
        <>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Khắc tên:</span>
            <span className="font-medium">{formatCurrency(engravePrice)}</span>
          </div>
        </>
      )}

      <Separator />

      <div className="flex justify-between items-center">
        <span className="font-semibold">Tổng cộng:</span>
        <span className="text-2xl font-bold text-primary">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}

