"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { FilterState } from "@/components/ProductFilter"

interface FilterContextType {
  filters: FilterState | null
  setFilters: (filters: FilterState) => void
  priceRange: [number, number] | null
  setPriceRange: (range: [number, number]) => void
  productCount: number
  setProductCount: (count: number) => void
  onReset: (() => void) | null
  setOnReset: (fn: () => void) => void
  onFilterChange: ((filters: FilterState) => void) | null
  setOnFilterChange: (fn: (filters: FilterState) => void) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [productCount, setProductCount] = useState(0)
  const [onReset, setOnReset] = useState<(() => void) | null>(null)
  const [onFilterChange, setOnFilterChange] = useState<((filters: FilterState) => void) | null>(null)

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        priceRange,
        setPriceRange,
        productCount,
        setProductCount,
        onReset,
        setOnReset,
        onFilterChange,
        setOnFilterChange,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilterContext() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    // Return default values instead of throwing error
    return {
      filters: null,
      setFilters: () => {},
      priceRange: null,
      setPriceRange: () => {},
      productCount: 0,
      setProductCount: () => {},
      onReset: null,
      setOnReset: () => {},
      onFilterChange: null,
      setOnFilterChange: () => {},
    }
  }
  return context
}

