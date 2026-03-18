"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Product } from "@/lib/types"
import { productsApi } from "@/lib/api/products"
import { formatCurrency } from "@/lib/utils"

function normalizeForSearch(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/\s+/g, " ")
    .trim()
}

type SearchBarProps = {
  onAfterNavigate?: () => void
}

export function SearchBar({ onAfterNavigate }: SearchBarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isFetchingProducts, setIsFetchingProducts] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all products on mount (cached)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsFetchingProducts(true)
        const allProducts = await productsApi.getAll()
        setProducts(allProducts)
      } catch (error) {
        console.error("Error fetching products for search:", error)
      } finally {
        setIsFetchingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  // Debounce search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
      const query = normalizeForSearch(searchQuery)
      const filtered = products.filter((product) => {
        const nameMatch = normalizeForSearch(product.name).includes(query)
        const slugMatch = normalizeForSearch(product.slug).includes(query)
        // IMPORTANT: Only match by product name/slug to avoid cases where
        // other product types (e.g. "Dây chuyền") contain "Vòng tay" in description.
        return nameMatch || slugMatch
      })
      setFilteredProducts(filtered.slice(0, 8)) // Limit to 8 results
      setIsOpen(true)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, products])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle product click
  const handleProductClick = useCallback((slug: string) => {
    setIsOpen(false)
    setSearchQuery("")
    router.push(`/products/${slug}`)
    onAfterNavigate?.()
  }, [router, onAfterNavigate])

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.trim() && filteredProducts.length > 0) {
      setIsOpen(true)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === "Enter" && filteredProducts.length > 0) {
      // Navigate to first result on Enter
      handleProductClick(filteredProducts[0].slug)
    }
  }

  // Clear search
  const handleClear = () => {
    setSearchQuery("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 h-9 md:h-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-[100] max-h-[400px] overflow-y-auto">
          {isFetchingProducts ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="py-2">
              {filteredProducts.map((product) => {
                const imageUrl = product.images && product.images.length > 0 
                  ? product.images[0] 
                  : "/logo-artemis-white.png"
                
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleProductClick(product.slug)
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {product.description || "Sản phẩm ARTEMIS"}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {formatCurrency(product.priceFrom)}
                        {product.originalPrice && product.originalPrice > product.priceFrom && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : searchQuery.trim() ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Không tìm thấy sản phẩm nào với từ khóa &quot;{searchQuery}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
