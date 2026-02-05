"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { newsApi } from "@/lib/api/news"
import { ChildAbductionArticle } from "@/lib/types"
import Image from "next/image"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { Calendar, ExternalLink, AlertTriangle, ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
dayjs.locale("vi")

export default function NewsPage() {
  const [allArticles, setAllArticles] = useState<ChildAbductionArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(6)
  const [totalCount, setTotalCount] = useState(0)
  const [sources, setSources] = useState<string[]>([])

  // Load all articles on mount
  useEffect(() => {
    fetchAllNews()
  }, [])

  // Reset page when search query changes (separate effect to avoid loop)
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      setPage(1)
    }
  }, [searchQuery])

  // Use useMemo to filter articles (avoids re-render issues)
  const filteredArticles = useMemo(() => {
    if (!allArticles.length) return []

    if (searchQuery.trim() === "") {
      return allArticles
    }

    return allArticles.filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allArticles, searchQuery])

  // Paginate filtered articles
  const articles = useMemo(() => {
    if (searchQuery.trim() === "") {
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      return filteredArticles.slice(startIndex, endIndex)
    }
    return filteredArticles
  }, [filteredArticles, page, pageSize, searchQuery])

  const totalPages = useMemo(() => {
    if (searchQuery.trim() === "") {
      return Math.ceil(filteredArticles.length / pageSize)
    }
    return 1
  }, [filteredArticles.length, pageSize, searchQuery])

  const fetchAllNews = async () => {
    try {
      setLoading(true)
      // Load all articles with a large pageSize
      const data = await newsApi.getChildAbductionNews(1, 100)
      setAllArticles(data.articles || [])
      setTotalCount(data.totalCount || 0)
      setSources(data.sources || [])
    } catch (error: any) {
      console.error("Error fetching child abduction news:", error)
      setAllArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  if (loading && allArticles.length === 0) {
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
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl md:text-4xl font-bold">Tin tức về An toàn Trẻ em</h1>
        </div>
        <p className="text-muted-foreground">
          Cập nhật những tin tức mới nhất về an toàn trẻ em và phòng chống bắt cóc
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Thông tin nguồn tin</AlertTitle>
        <AlertDescription>
          Tin tức được tổng hợp từ {sources.length} nguồn uy tín: {sources.join(", ")}.
          Tổng cộng có <strong>{totalCount}</strong> bài viết liên quan.
        </AlertDescription>
      </Alert>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Tìm thấy <strong>{filteredArticles.length}</strong> bài viết phù hợp với &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* News Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? `Không tìm thấy bài viết nào với "${searchQuery}"` : "Không có tin tức nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {article.imageUrl && (
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.source}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {dayjs(article.publishedDate).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <span>Xem chi tiết</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))}
          </div>

          {/* Pagination - Only show if not searching */}
          {!searchQuery && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Trang trước
              </Button>
              <div className="text-sm text-muted-foreground">
                Trang <strong>{page}</strong> / <strong>{totalPages}</strong>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="gap-2"
              >
                Trang sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
