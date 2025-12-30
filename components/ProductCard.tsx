"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured }: ProductCardProps) {
  const [averageRating, setAverageRating] = useState<number>(0)
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [loadingRating, setLoadingRating] = useState(true)
  const [soldQuantity, setSoldQuantity] = useState<number | null>(null)

  useEffect(() => {
    const fetchRating = async () => {
      try {
        // Use slug to be consistent with product detail & backend reviews endpoint
        const response = await fetch(`/api/products/${product.slug}/rating`)
        if (response.ok) {
          const data = await response.json()
          setAverageRating(data.averageRating || 0)
          setReviewCount(data.reviewCount || 0)
        }
      } catch (error) {
        console.error("Error fetching rating:", error)
      } finally {
        setLoadingRating(false)
      }
    }

    fetchRating()
  }, [product.slug])

  // Fetch sold quantity for product card (using product ID for statistics endpoint)
  useEffect(() => {
    const fetchSoldQuantity = async () => {
      try {
        const response = await fetch(`/api/products/${product.id}/sold-quantity`)
        if (response.ok) {
          const data = await response.json()
          setSoldQuantity(typeof data.soldQuantity === "number" ? data.soldQuantity : 0)
        }
      } catch (error) {
        console.error("Error fetching sold quantity:", error)
        setSoldQuantity(0)
      }
    }

    fetchSoldQuantity()
  }, [product.id])

  // Render stars based on average rating
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(averageRating)
    const hasHalfStar = averageRating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Full star
        stars.push(
          <Star
            key={i}
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400 fill-yellow-400"
          />
        )
      } else if (i === fullStars && hasHalfStar) {
        // Half star (we'll show as full for simplicity, or you can use a half-star icon)
        stars.push(
          <Star
            key={i}
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400 fill-yellow-400 opacity-50"
          />
        )
      } else {
        // Empty star
        stars.push(
          <Star
            key={i}
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-300 fill-gray-300"
          />
        )
      }
    }
    return stars
  }
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Link href={`/products/${product.slug}`}>
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
            <Image 
              src={product.images[0]} 
              alt={product.name}
              fill
              className="object-contain p-2 sm:p-3 md:p-4"
            />
            {/* Discount badge - top left corner */}
            {product.originalPrice !== null && product.originalPrice > product.priceFrom && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-xs font-bold px-2 py-1 z-10 rounded-md"
              >
                -{Math.round(((product.originalPrice - product.priceFrom) / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex items-start justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-2">
                  {product.name}
                </h3>
                {/* Dynamic rating display based on actual reviews - only show stars */}
                <div className="flex flex-col gap-0.5 mt-1">
                  {!loadingRating && averageRating > 0 && (
                    <div className="flex items-center gap-0.5">
                      {renderStars()}
                    </div>
                  )}
                  {!loadingRating && averageRating === 0 && reviewCount === 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-300 fill-gray-300"
                        />
                      ))}
                    </div>
                  )}
                  {loadingRating && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-300 fill-gray-300 animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-1 flex-shrink-0">
                {featured && (
                  <Badge className="whitespace-nowrap text-[10px] sm:text-xs">
                    ⭐ Bán chạy
                  </Badge>
                )}
                {product.slug === "bunny-baby-pink" && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-pink-400 to-pink-600 text-white border-0 whitespace-nowrap text-[10px] sm:text-xs"
                  >
                    🐰 Hot
                  </Badge>
                )}
                {product.slug === "bunny-pink" && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500 text-white border-0 whitespace-nowrap text-[10px] sm:text-xs"
                  >
                    💰 Giá tốt
                  </Badge>
                )}
                {(product.slug === "bunny-lavender" ||
                  product.slug === "bunny-yellow" ||
                  product.slug === "bunny-mint") && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-500 text-white border-0 whitespace-nowrap text-[10px] sm:text-xs"
                  >
                    ✨ Mới
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-wrap mt-2 sm:mt-3">
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                {product.specs.waterproof}
              </Badge>
              {product.specs.gps && (
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  GPS
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-2 sm:p-3 md:p-4 pt-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm text-muted-foreground">Từ</span>
              <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                {formatCurrency(product.priceFrom)}
              </span>
              {product.originalPrice !== null && product.originalPrice > product.priceFrom && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

