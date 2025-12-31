"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ProductCard } from "@/components/ProductCard"
import { ProductFilter, FilterState } from "@/components/ProductFilter"
import { Pagination } from "@/components/Pagination"
import { Product } from "@/lib/types"
import { productsApi, BackendProduct } from "@/lib/api/products"
import { categoriesApi, Category } from "@/lib/api/categories"
import { ChevronRight, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useFilterContext } from "@/contexts/FilterContext"

const ITEMS_PER_PAGE = 6

export function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const filterContext = useFilterContext()
  
  const [products, setProducts] = useState<Product[]>([])
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]) // Will be calculated from products
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000000], // Will be updated after products load
    productTypes: [],
    sortBy: "default",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  
  // Use refs to track previous values and prevent infinite loops
  const prevFiltersRef = useRef<FilterState | null>(null)
  const prevPriceRangeRef = useRef<[number, number] | null>(null)
  const prevProductCountRef = useRef<number>(0)
  const priceRangeRef = useRef<[number, number]>([0, 10000000])

  // Update priceRangeRef whenever priceRange changes
  useEffect(() => {
    priceRangeRef.current = priceRange
  }, [priceRange])

  const handleReset = useCallback(() => {
    setFilters({
      priceRange: priceRangeRef.current || [0, 10000000],
      productTypes: [],
      sortBy: "default",
    })
    setCurrentPage(1)
  }, [])

  // Memoize the filter change callback to prevent infinite loops
  const handleFilterChange = useCallback((newFilters: FilterState | null) => {
    // Ensure newFilters is not null and priceRange exists, fallback to priceRange if missing
    if (newFilters) {
      const currentPriceRange = priceRangeRef.current || [0, 10000000]
      setFilters({
        priceRange: newFilters.priceRange || currentPriceRange,
        productTypes: newFilters.productTypes || [],
        sortBy: newFilters.sortBy || "default",
      })
    } else {
      // If newFilters is null, use current priceRange or default
      const currentPriceRange = priceRangeRef.current || [0, 10000000]
      setFilters({
        priceRange: currentPriceRange,
        productTypes: [],
        sortBy: "default",
      })
    }
  }, [])

  // Set callbacks only once on mount
  useEffect(() => {
    filterContext.setOnReset(handleReset)
    filterContext.setOnFilterChange(handleFilterChange)
  }, [filterContext, handleReset, handleFilterChange])

  // Update filter context when filters change (only if values actually changed)
  useEffect(() => {
    // Only update if values are different to avoid infinite loops
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)
    const priceRangeChanged = JSON.stringify(prevPriceRangeRef.current) !== JSON.stringify(priceRange)
    const productCountChanged = prevProductCountRef.current !== filteredProducts.length
    
    if (filtersChanged) {
      filterContext.setFilters(filters)
      prevFiltersRef.current = filters
    }
    if (priceRangeChanged) {
      filterContext.setPriceRange(priceRange)
      prevPriceRangeRef.current = priceRange
    }
    if (productCountChanged) {
      filterContext.setProductCount(filteredProducts.length)
      prevProductCountRef.current = filteredProducts.length
    }
  }, [filters, priceRange, filteredProducts.length, filterContext])

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [productsData, categoriesData] = await Promise.all([
          productsApi.getAll(),
          categoriesApi.getAll(),
        ])
        
        setCategories(categoriesData)
        
        // Fetch full backend products for category filtering (with caching)
        const { API_BASE_URL } = await import("@/lib/constants")
        const { cachedFetch, cacheConfigs } = await import("@/lib/cache")
        const backendProductsData = await cachedFetch<BackendProduct[]>(
          `${API_BASE_URL}/api/Products`,
          {
            method: "GET",
            headers: { "accept": "*/*" },
          },
          cacheConfigs.products
        )
        setBackendProducts(backendProductsData.filter((p: BackendProduct) => p.isActive))
        
        setProducts(productsData)
        
        // Calculate price range from all products
        if (productsData.length > 0) {
          const prices = productsData.map(p => p.priceFrom).filter(p => p > 0)
          if (prices.length > 0) {
            const minPrice = Math.floor(Math.min(...prices) / 10000) * 10000 // Round down to nearest 10k
            const maxPrice = Math.ceil(Math.max(...prices) / 10000) * 10000 // Round up to nearest 10k
            const calculatedRange: [number, number] = [Math.max(0, minPrice - 50000), maxPrice + 50000] // Add some padding
            setPriceRange(calculatedRange)
            // Update filters with calculated range
            setFilters(prev => ({
              priceRange: calculatedRange,
              productTypes: prev?.productTypes || [],
              sortBy: prev?.sortBy || "default",
            }))
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Không thể tải dữ liệu")
        setProducts([])
        setBackendProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Find selected category from URL param
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const category = categories.find(
        (cat) => cat.name === decodeURIComponent(categoryParam) || cat.id === categoryParam
      )
      setSelectedCategory(category || null)
    } else {
      setSelectedCategory(null)
      // When no category param, reset filters to show all products
      if (priceRange && Array.isArray(priceRange) && priceRange.length === 2 && 
          (priceRange[0] !== 0 || priceRange[1] !== 10000000)) {
        setFilters(prev => ({
          priceRange: priceRange,
          productTypes: [],
          sortBy: prev?.sortBy || "default",
        }))
      }
    }
  }, [categoryParam, categories, priceRange])

  // Apply filters including category filter
  useEffect(() => {
    let result = [...products]

    // Ensure filters and priceRange have valid default values
    const safeFilters = filters || {
      priceRange: [0, 10000000] as [number, number],
      productTypes: [],
      sortBy: "default",
    }
    const safePriceRange: [number, number] = 
      (priceRange && Array.isArray(priceRange) && priceRange.length === 2) 
        ? priceRange 
        : [0, 10000000]
    const safeFiltersPriceRange: [number, number] = 
      (safeFilters.priceRange && Array.isArray(safeFilters.priceRange) && safeFilters.priceRange.length === 2)
        ? safeFilters.priceRange
        : safePriceRange

    // Category filter - only apply if a category is selected
    // If no category selected (selectedCategory is null), show all products
    if (selectedCategory) {
      if (selectedCategory.id) {
        const categoryProductIds = backendProducts
          .filter((p) => p.categoryId === selectedCategory.id)
          .map((p) => p.id)
        result = result.filter((p) => categoryProductIds.includes(p.id))
      } else {
        // Fallback: filter by category name if no id
        // This is a workaround - ideally categories should have ids
        result = result.filter((p) => {
          const backendProduct = backendProducts.find((bp) => bp.id === p.id)
          return backendProduct?.categoryId === selectedCategory.name
        })
      }
    }
    // If selectedCategory is null, don't filter by category (show all)

    // Price filter - only apply if price range is not the full range
    if (safeFiltersPriceRange[0] !== safePriceRange[0] || safeFiltersPriceRange[1] !== safePriceRange[1]) {
      result = result.filter(
        (p) =>
          p.priceFrom >= safeFiltersPriceRange[0] &&
          p.priceFrom <= safeFiltersPriceRange[1]
      )
    }

    // Product type filter
    if (safeFilters.productTypes && Array.isArray(safeFilters.productTypes) && safeFilters.productTypes.length > 0) {
      result = result.filter((p) => {
        const productType = p.id.startsWith('necklace-') ? 'necklace' 
          : p.id.startsWith('clip-') ? 'clip'
          : 'bracelet'
        return safeFilters.productTypes.includes(productType)
      })
    }

    // Sort
    const sortBy = safeFilters.sortBy || "default"
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.priceFrom - b.priceFrom)
        break
      case "price-desc":
        result.sort((a, b) => b.priceFrom - a.priceFrom)
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // Default: Sort by createdAt (newest first)
        result.sort((a, b) => {
          const productA = backendProducts.find((bp) => bp.id === a.id)
          const productB = backendProducts.find((bp) => bp.id === b.id)
          
          const dateA = productA?.createdAt ? new Date(productA.createdAt).getTime() : 0
          const dateB = productB?.createdAt ? new Date(productB.createdAt).getTime() : 0
          
          // Newest first (descending order)
          return dateB - dateA
        })
        break
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [filters, products, selectedCategory, backendProducts, priceRange])

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="container py-8 md:py-12 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 md:py-12 px-4">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Lỗi tải sản phẩm</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12 px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        {selectedCategory ? (
          <>
            <Link href="/products" className="hover:text-primary">Sản phẩm</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{selectedCategory.name}</span>
          </>
        ) : (
          <span className="text-foreground">Sản phẩm</span>
        )}
      </div>

      <div className="mb-6 md:mb-12">
        <div className="flex items-start justify-between gap-4 mb-4 md:mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-pink-500">
              {selectedCategory ? selectedCategory.name.toUpperCase() : "Sản phẩm vòng tay ARTEMIS"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              {selectedCategory 
                ? `Danh sách sản phẩm thuộc danh mục ${selectedCategory.name}`
                : "Chọn sản phẩm phù hợp và bắt đầu tùy biến theo phong cách của bé"
              }
            </p>
          </div>
          
          {/* Filter Button - Mobile Only */}
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="lg:hidden flex items-center gap-2"
                aria-label="Mở bộ lọc"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Lọc</span>
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
                  filters={filters || {
                    priceRange: [0, 10000000],
                    productTypes: [],
                    sortBy: "default",
                  }}
                  onFilterChange={(newFilters) => {
                    setFilters({
                      priceRange: newFilters?.priceRange || [0, 10000000],
                      productTypes: newFilters?.productTypes || [],
                      sortBy: newFilters?.sortBy || "default",
                    })
                    // Optionally close sheet after applying filter
                    // setFilterSheetOpen(false)
                  }}
                  onReset={() => {
                    handleReset()
                    // Optionally close sheet after reset
                    // setFilterSheetOpen(false)
                  }}
                  productCount={filteredProducts.length}
                  priceRange={priceRange || [0, 10000000]}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar Filter - Desktop Only */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilter
            filters={filters || {
              priceRange: [0, 10000000],
              productTypes: [],
              sortBy: "default",
            }}
            onFilterChange={(newFilters) => {
              setFilters({
                priceRange: newFilters?.priceRange || [0, 10000000],
                productTypes: newFilters?.productTypes || [],
                sortBy: newFilters?.sortBy || "default",
              })
            }}
            onReset={handleReset}
            productCount={filteredProducts.length}
            priceRange={priceRange || [0, 10000000]}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredProducts.length}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-muted-foreground mb-6">
                Thử thay đổi bộ lọc để xem thêm sản phẩm
              </p>
              <button
                onClick={handleReset}
                className="text-primary hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

