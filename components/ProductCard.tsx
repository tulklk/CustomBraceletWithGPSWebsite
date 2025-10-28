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
    >
      <Link href={`/products/${product.slug}`}>
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-8 relative">
            <Image 
              src={product.images[0]} 
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <div className="flex flex-col gap-1">
                {featured && <Badge className="whitespace-nowrap">⭐ Bán chạy</Badge>}
                {product.slug === 'bunny-baby-pink' && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-pink-400 to-pink-600 text-white border-0 whitespace-nowrap">
                    🐰 Hot
                  </Badge>
                )}
                {product.slug === 'bunny-pink' && (
                  <Badge variant="secondary" className="bg-green-500 text-white border-0 whitespace-nowrap">
                    💰 Giá tốt
                  </Badge>
                )}
                {(product.slug === 'bunny-lavender' || product.slug === 'bunny-yellow' || product.slug === 'bunny-mint') && (
                  <Badge variant="secondary" className="bg-blue-500 text-white border-0 whitespace-nowrap">
                    ✨ Mới
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {product.specs.waterproof}
              </Badge>
              {product.specs.gps && (
                <Badge variant="outline" className="text-xs">
                  GPS
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">Từ</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(product.priceFrom)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

