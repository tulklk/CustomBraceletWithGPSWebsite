"use client"

import { Accessory } from "@/lib/types"
import { useCustomizer } from "@/store/useCustomizer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { X, Plus, Sparkles } from "lucide-react"
import { MAX_ACCESSORIES } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface AccessoryBoardProps {
  accessories: Accessory[]
}

export function AccessoryBoard({ accessories }: AccessoryBoardProps) {
  const { accessories: selected, addAccessory, removeAccessory } = useCustomizer()
  const { toast } = useToast()

  const getAccessoryById = (id: string) => {
    return accessories.find((a) => a.id === id)
  }

  const handleAddAccessory = (accessory: Accessory) => {
    if (selected.length >= MAX_ACCESSORIES) {
      toast({
        title: "Đã đạt giới hạn",
        description: `Tối đa ${MAX_ACCESSORIES} charm trên vòng tay`,
        variant: "destructive",
      })
      return
    }

    // Tự động chọn vị trí (dọc theo dây từ trái sang phải)
    const positions: Array<"top" | "left" | "right" | "bottom"> = ["top", "left", "right", "bottom"]
    const position = positions[selected.length % 4]

    addAccessory(accessory.id, position, accessory.price)
    toast({
      title: "Đã thêm charm!",
      description: `${accessory.name} - ${formatCurrency(accessory.price)}`,
    })
  }

  const handleRemoveAccessory = (accessoryId: string) => {
    removeAccessory(accessoryId)
    toast({
      title: "Đã xóa charm",
    })
  }

  return (
    <div className="space-y-6">
      {/* Selected Charms Preview */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Charm đã chọn ({selected.length}/{MAX_ACCESSORIES})
        </h3>
        
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
            {selected.map((acc) => {
              const accessory = getAccessoryById(acc.accessoryId)
              if (!accessory) return null
              
              return (
                <div
                  key={acc.accessoryId}
                  className="relative group"
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                    <span className="text-2xl">{accessory.icon}</span>
                    <span className="text-sm font-medium">{accessory.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAccessory(accessory.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
            <p className="text-muted-foreground text-sm">
              Chưa có charm nào. Chọn charm bên dưới để thêm!
            </p>
          </div>
        )}
      </div>

      {/* Available Accessories */}
      <div>
        <h3 className="font-semibold mb-3">Charm có sẵn</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Click vào charm để thêm vào vòng tay (tối đa {MAX_ACCESSORIES} charm)
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
          {accessories.map((accessory) => {
            const isSelected = selected.some((s) => s.accessoryId === accessory.id)
            
            return (
              <Card
                key={accessory.id}
                className={`hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                }`}
                onClick={() => !isSelected && handleAddAccessory(accessory)}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{accessory.icon}</div>
                    <p className="text-sm font-medium mb-1">{accessory.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency(accessory.price)}
                    </Badge>
                    
                    {isSelected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAccessory(accessory.id)
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Xóa
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full mt-2"
                        disabled={selected.length >= MAX_ACCESSORIES}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

