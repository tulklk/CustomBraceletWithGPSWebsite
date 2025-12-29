"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured }: ProductCardProps) {
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
          </div>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex items-start justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-2 flex-1">{product.name}</h3>
              <div className="flex flex-col gap-0.5 sm:gap-1 flex-shrink-0">
                {featured && <Badge className="whitespace-nowrap text-[10px] sm:text-xs">⭐ Bán chạy</Badge>}
                {product.slug === 'bunny-baby-pink' && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-pink-400 to-pink-600 text-white border-0 whitespace-nowrap text-[10px] sm:text-xs">
                    🐰 Hot
                  </Badge>
                )}
                {product.slug === 'bunny-pink' && (
                  <Badge variant="secondary" className="bg-green-500 text-white border-0 whitespace-nowrap text-[10px] sm:text-xs">
                    💰 Giá tốt
                  </Badge>
                )}
                {(product.slug === 'bunny-lavender' || product.slug === 'bunny-yellow' || product.slug === 'bunny-mint') && (
                  <Badge variant="secondary" className="bg-blue-500 text-white border-0 whitespace-nowrap text-[10px] sm:text-xs">
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
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm text-muted-foreground">Từ</span>
              <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                {formatCurrency(product.priceFrom)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

