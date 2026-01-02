"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { newsApi } from "@/lib/api/news"
import { NewsDto } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { Search, Calendar, Eye, User } from "lucide-react"
dayjs.locale("vi")

export default function NewsPage() {
  const [news, setNews] = useState<NewsDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [category, setCategory] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // Get unique categories from news
  const categories = useMemo(() => {
    const cats = news.map((item) => item.category).filter(Boolean) as string[]
    return Array.from(new Set(cats)).sort()
  }, [news])

  useEffect(() => {
    fetchNews()
  }, [page, category, search])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const data = await newsApi.getAll({
        page,
        pageSize,
        category: category === "all" ? undefined : category,
        search: search || undefined,
      })
      setNews(data)
    } catch (error: any) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1) // Reset to first page when searching
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1) // Reset to first page when changing category
  }

  if (loading && news.length === 0) {
    return (
      <div className="container py-8 md:py-12 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải tin tức...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Tin tức</h1>
        <p className="text-muted-foreground">
          Cập nhật những tin tức mới nhất về sản phẩm và dịch vụ
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Tìm kiếm tin tức..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
          <div className="w-full sm:w-48">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(search || category !== "all") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Đang lọc:</span>
            {search && (
              <Badge variant="secondary" className="gap-1">
                Tìm kiếm: {search}
                <button
                  onClick={() => {
                    setSearch("")
                    setSearchInput("")
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {category !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Danh mục: {category}
                <button
                  onClick={() => setCategory("all")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {search || category !== "all"
              ? "Không tìm thấy tin tức nào"
              : "Chưa có tin tức nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {news.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/news/${item.slug}`}>
                  {item.thumbnailUrl && (
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    {item.category && (
                      <Badge variant="outline" className="mb-2">
                        {item.category}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {item.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {item.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {dayjs(item.publishedAt).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{item.viewCount || 0}</span>
                        </div>
                      </div>
                      {item.authorName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{item.authorName}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {news.length >= pageSize && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={news.length < pageSize}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

