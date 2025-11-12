"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/ProductCard"
import { ProductFilter, FilterState } from "@/components/ProductFilter"
import { Pagination } from "@/components/Pagination"
import { Product } from "@/lib/types"

const initialFilters: FilterState = {
  priceRange: [500000, 600000],
  productTypes: [],
  sortBy: "default",
}

const ITEMS_PER_PAGE = 6

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setFilteredProducts(data)
      })
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...products]

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
  }, [filters, products])

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

  return (
    <div className="container py-8 md:py-12 px-4">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-pink-500">Sản phẩm vòng tay ARTEMIS</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Chọn sản phẩm phù hợp và bắt đầu tùy biến theo phong cách của bé
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

