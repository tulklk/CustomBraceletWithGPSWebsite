"use client"

import Link from "next/link"
import Image from "next/image"
import { SuggestedProduct } from "@/lib/types"
import { Star, ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"

interface ChatProductCardProps {
  product: SuggestedProduct
}

export function ChatProductCard({ product }: ChatProductCardProps) {
  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const imageUrl = product.primaryImageUrl || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/products/${product.id}`}
        className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-primary/50"
      >
        <div className="flex gap-3">
          {/* Image */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {product.name}
            </h4>
            {product.brand && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.brand}</p>
            )}

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {product.averageRating.toFixed(1)} ({product.reviewCount})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

