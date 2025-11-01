"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, SlidersHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"

export interface FilterState {
  priceRange: [number, number]
  productTypes: string[]
  sortBy: string
}

interface ProductFilterProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
  productCount: number
}

export function ProductFilter({
  filters,
  onFilterChange,
  onReset,
  productCount,
}: ProductFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleProductTypeToggle = (value: string) => {
    const newProductTypes = filters.productTypes.includes(value)
      ? filters.productTypes.filter((t) => t !== value)
      : [...filters.productTypes, value]
    onFilterChange({ ...filters, productTypes: newProductTypes })
  }

  const activeFiltersCount =
    (filters.productTypes.length > 0 ? 1 : 0) +
    (filters.priceRange[0] !== 299000 || filters.priceRange[1] !== 499000 ? 1 : 0)

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader className="py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <CardTitle className="text-base md:text-lg text-primary">Bộ lọc</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">{activeFiltersCount}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:flex text-xs md:text-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Thu gọn" : "Mở rộng"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6 pb-4 md:pb-6">
          {/* Sort */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Sắp xếp</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                onFilterChange({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                <SelectItem value="name-desc">Tên: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Khoảng giá</Label>
            <div className="px-2 py-4">
              <Slider
                min={299000}
                max={499000}
                step={50000}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(filters.priceRange[0])}
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(filters.priceRange[1])}
              </span>
            </div>
          </div>

          <Separator />

          {/* Product Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Loại sản phẩm</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bracelet"
                  checked={filters.productTypes.includes("bracelet")}
                  onCheckedChange={() => handleProductTypeToggle("bracelet")}
                />
                <label
                  htmlFor="bracelet"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Vòng tay thông minh
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="necklace"
                  checked={filters.productTypes.includes("necklace")}
                  onCheckedChange={() => handleProductTypeToggle("necklace")}
                />
                <label
                  htmlFor="necklace"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Dây chuyền
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clip"
                  checked={filters.productTypes.includes("clip")}
                  onCheckedChange={() => handleProductTypeToggle("clip")}
                />
                <label
                  htmlFor="clip"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Pin kẹp quần áo
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Results & Reset */}
          <div className="space-y-3 pt-2">
            <div className="text-sm text-center text-muted-foreground">
              Tìm thấy <span className="font-bold text-foreground">{productCount}</span> sản phẩm
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onReset}
              >
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

