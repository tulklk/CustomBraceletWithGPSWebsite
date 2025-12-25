"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ProductCard } from "@/components/ProductCard"
import { ProductFilter, FilterState } from "@/components/ProductFilter"
import { Pagination } from "@/components/Pagination"
import { Product } from "@/lib/types"
import { productsApi, BackendProduct } from "@/lib/api/products"
import { categoriesApi, Category } from "@/lib/api/categories"
import { ChevronRight } from "lucide-react"

const initialFilters: FilterState = {
  priceRange: [500000, 600000],
  productTypes: [],
  sortBy: "default",
}

const ITEMS_PER_PAGE = 6

export function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  
  const [products, setProducts] = useState<Product[]>([])
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        
        // Fetch full backend products for category filtering
        const { API_BASE_URL } = await import("@/lib/constants")
        const response = await fetch(`${API_BASE_URL}/api/Products`, {
          method: "GET",
          headers: { "accept": "*/*" },
        })
        const backendProductsData = await response.json()
        setBackendProducts(backendProductsData.filter((p: BackendProduct) => p.isActive))
        
        setProducts(productsData)
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
    }
  }, [categoryParam, categories])

  // Apply filters including category filter
  useEffect(() => {
    let result = [...products]

    // Category filter - filter by categoryId from backend products
    if (selectedCategory && selectedCategory.id) {
      const categoryProductIds = backendProducts
        .filter((p) => p.categoryId === selectedCategory.id)
        .map((p) => p.id)
      result = result.filter((p) => categoryProductIds.includes(p.id))
    } else if (selectedCategory && !selectedCategory.id) {
      // Fallback: filter by category name if no id
      // This is a workaround - ideally categories should have ids
      result = result.filter((p) => {
        const backendProduct = backendProducts.find((bp) => bp.id === p.id)
        return backendProduct?.categoryId === selectedCategory.name
      })
    }

    // Price filter
    result = result.filter(
      (p) =>
        p.priceFrom >= filters.priceRange[0] &&
        p.priceFrom <= filters.priceRange[1]
    )

    // Product type filter
    if (filters.productTypes.length > 0) {
      result = result.filter((p) => {
        const productType = p.id.startsWith('necklace-') ? 'necklace' 
          : p.id.startsWith('clip-') ? 'clip'
          : 'bracelet'
        return filters.productTypes.includes(productType)
      })
    }

    // Sort
    switch (filters.sortBy) {
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
        // Default order
        break
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [filters, products, selectedCategory, backendProducts])

  const handleReset = () => {
    setFilters(initialFilters)
    setCurrentPage(1)
  }

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

      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-pink-500">
          {selectedCategory ? selectedCategory.name.toUpperCase() : "Sản phẩm vòng tay ARTEMIS"}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {selectedCategory 
            ? `Danh sách sản phẩm thuộc danh mục ${selectedCategory.name}`
            : "Chọn sản phẩm phù hợp và bắt đầu tùy biến theo phong cách của bé"
          }
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar Filter */}
        <div className="lg:col-span-1">
          <ProductFilter
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleReset}
            productCount={filteredProducts.length}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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

