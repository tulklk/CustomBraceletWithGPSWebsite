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
  waterproof: string[]
  ageRange: string
  hasGPS: boolean
  hasSimCard: boolean
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

  const handleWaterproofToggle = (value: string) => {
    const newWaterproof = filters.waterproof.includes(value)
      ? filters.waterproof.filter((w) => w !== value)
      : [...filters.waterproof, value]
    onFilterChange({ ...filters, waterproof: newWaterproof })
  }

  const activeFiltersCount =
    (filters.waterproof.length > 0 ? 1 : 0) +
    (filters.ageRange !== "all" ? 1 : 0) +
    (filters.hasGPS ? 1 : 0) +
    (filters.hasSimCard ? 1 : 0) +
    (filters.priceRange[0] !== 500000 || filters.priceRange[1] !== 3000000 ? 1 : 0)

  return (
    <Card className="lg:sticky lg:top-20">
      <CardHeader className="py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5" />
            <CardTitle className="text-base md:text-lg">Bộ lọc</CardTitle>
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
                min={500000}
                max={3000000}
                step={100000}
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

          {/* Age Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Độ tuổi</Label>
            <Select
              value={filters.ageRange}
              onValueChange={(value) =>
                onFilterChange({ ...filters, ageRange: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ tuổi</SelectItem>
                <SelectItem value="3-6">3-6 tuổi</SelectItem>
                <SelectItem value="6-10">6-10 tuổi</SelectItem>
                <SelectItem value="10-15">10-15 tuổi</SelectItem>
                <SelectItem value="13-18">13-18 tuổi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Waterproof */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Chống nước</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ip65"
                  checked={filters.waterproof.includes("IP65")}
                  onCheckedChange={() => handleWaterproofToggle("IP65")}
                />
                <label
                  htmlFor="ip65"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  IP65 (Chống bụi, chống nước nhẹ)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ip67"
                  checked={filters.waterproof.includes("IP67")}
                  onCheckedChange={() => handleWaterproofToggle("IP67")}
                />
                <label
                  htmlFor="ip67"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  IP67 (Ngâm nước 30 phút)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ip68"
                  checked={filters.waterproof.includes("IP68")}
                  onCheckedChange={() => handleWaterproofToggle("IP68")}
                />
                <label
                  htmlFor="ip68"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  IP68 (Bơi lội, chống nước tốt)
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Tính năng</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gps"
                  checked={filters.hasGPS}
                  onCheckedChange={(checked: boolean) =>
                    onFilterChange({ ...filters, hasGPS: !!checked })
                  }
                />
                <label
                  htmlFor="gps"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Có GPS
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="simcard"
                  checked={filters.hasSimCard}
                  onCheckedChange={(checked: boolean) =>
                    onFilterChange({ ...filters, hasSimCard: !!checked })
                  }
                />
                <label
                  htmlFor="simcard"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Có SIM card
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

