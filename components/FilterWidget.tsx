"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ProductFilter } from "@/components/ProductFilter"
import { useFilterContext } from "@/contexts/FilterContext"

export function FilterWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { filters, priceRange, productCount, onReset, onFilterChange } = useFilterContext()
  
  // Only show on products page
  const isProductsPage = pathname?.startsWith('/products')
  
  if (!isProductsPage) {
    return null
  }
  
  if (!filters || !priceRange || !onFilterChange) {
    return null
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    // Call the callback from ProductsContent to update local state
    // This avoids circular dependency
    onFilterChange(newFilters)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-24 right-6 z-50"
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-16 w-16 shadow-2xl relative overflow-hidden bg-gradient-to-br from-primary via-primary to-pink-600 hover:from-primary/90 hover:via-primary/90 hover:to-pink-600/90 transition-all duration-300 border-2 border-white/20"
              aria-label="Mở bộ lọc"
            >
              {/* Gradient overlay animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Filter icon with animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <SlidersHorizontal className="h-7 w-7 relative z-10" />
              </motion.div>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 overflow-y-auto">
            <SheetHeader className="px-4 py-4 border-b">
              <SheetTitle className="text-lg font-bold text-pink-500">
                Bộ lọc
              </SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={onReset || (() => {})}
                productCount={productCount}
                priceRange={priceRange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    </AnimatePresence>
  )
}
