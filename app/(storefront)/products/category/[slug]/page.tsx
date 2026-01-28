"use client"

import { useEffect, useMemo, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { ProductsContent } from "../../ProductsContent"
import { categoriesApi, Category } from "@/lib/api/categories"
import { slugify } from "@/lib/utils"

export default function ProductsCategoryPage() {
  const params = useParams<{ slug: string }>()
  const slug = typeof params?.slug === "string" ? params.slug : ""

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await categoriesApi.getAll()
        setCategories(data)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const selectedCategory = useMemo(() => {
    if (!slug || categories.length === 0) return null
    return (
      categories.find((c) => (c.slug ? c.slug : slugify(c.name)) === slug) || null
    )
  }, [slug, categories])

  if (!loading && slug && !selectedCategory) {
    notFound()
  }

  // Prefer category id (stable) for filtering
  const categoryParamOverride = selectedCategory?.id || selectedCategory?.name || null

  return <ProductsContent categoryParamOverride={categoryParamOverride} />
}

