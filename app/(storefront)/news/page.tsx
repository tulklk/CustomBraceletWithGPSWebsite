"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { newsApi } from "@/lib/api/news"
import { NewsDto, ChildAbductionArticle } from "@/lib/types"
import Image from "next/image"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { Calendar, ExternalLink, AlertTriangle, ChevronLeft, ChevronRight, Search, X, Newspaper, User, Eye } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"

dayjs.locale("vi")

export default function NewsPage() {
  // Child Abduction News State
  const [abductionArticles, setAbductionArticles] = useState<ChildAbductionArticle[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [abductionTotalCount, setAbductionTotalCount] = useState(0)

  // Internal News State
  const [internalNews, setInternalNews] = useState<NewsDto[]>([])

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("internal")

  // Pagination for abduction news
  const [abductionPage, setAbductionPage] = useState(1)
  const abductionPageSize = 6

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [abductionData, internalData] = await Promise.all([
        newsApi.getChildAbductionNews(1, 100),
        newsApi.getAll({ pageSize: 100 })
      ])

      setAbductionArticles(abductionData.articles || [])
      setAbductionTotalCount(abductionData.totalCount || 0)
      setSources(abductionData.sources || [])

      setInternalNews(internalData || [])
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter internal news
  const filteredInternalNews = useMemo(() => {
    if (!internalNews.length) return []
    if (!searchQuery.trim()) return internalNews
    return internalNews.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [internalNews, searchQuery])

  // Filter and Paginate abduction news
  const filteredAbductionArticles = useMemo(() => {
    if (!abductionArticles.length) return []
    if (!searchQuery.trim()) return abductionArticles
    return abductionArticles.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [abductionArticles, searchQuery])

  const paginatedAbductionArticles = useMemo(() => {
    if (searchQuery.trim()) return filteredAbductionArticles
    const start = (abductionPage - 1) * abductionPageSize
    return filteredAbductionArticles.slice(start, start + abductionPageSize)
  }, [filteredAbductionArticles, abductionPage, searchQuery])

  const abductionTotalPages = Math.ceil(filteredAbductionArticles.length / abductionPageSize)

  if (loading && internalNews.length === 0 && abductionArticles.length === 0) {
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
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Tin tức & Sự kiện</h1>
        </div>
        <p className="text-muted-foreground">
          Cập nhật thông tin mới nhất từ Artemis và tin tức an toàn trẻ em
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm tin tức..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="internal">Tin tức Artemis</TabsTrigger>
          <TabsTrigger value="safety">An toàn Trẻ em</TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="space-y-8">
          {filteredInternalNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Không có tin tức nào</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternalNews.map((item) => {
                // Robust check for all fields to handle potential PascalCase from backend
                const title = item.title || (item as any).Title;
                const thumbnailUrl = item.thumbnailUrl || (item as any).ThumbnailUrl;
                const summary = item.summary || (item as any).Summary;
                const content = item.content || (item as any).Content;
                const authorName = item.authorName || (item as any).AuthorName;
                const viewCount = item.viewCount !== undefined ? item.viewCount : (item as any).ViewCount;
                const publishedAt = item.publishedAt || (item as any).PublishedAt || item.createdAt || (item as any).CreatedAt;
                const externalUrl = item.newsUrl || (item as any).newsURL || (item as any).NewsUrl;

                // Content snippet if summary is missing
                const displaySummary = summary || (content ? content.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "");

                const cardContent = (
                  <>
                    {thumbnailUrl && (
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <Image
                          src={thumbnailUrl}
                          alt={title || "News"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Hide image container if image fails to load
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) parent.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardContent className="p-4 flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        {item.category && (
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                      </h3>

                      {displaySummary && (
                        <div
                          className="text-sm text-muted-foreground line-clamp-3 mb-2"
                          dangerouslySetInnerHTML={{ __html: displaySummary }}
                        />
                      )}

                      <div className="mt-auto pt-4 flex flex-col gap-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{dayjs(publishedAt).format("DD/MM/YYYY")}</span>
                            </div>
                            {authorName && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{authorName}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-primary font-medium">
                              {externalUrl ? "Xem nguồn tin →" : "Đọc tiếp →"}
                            </div>
                            <div className="flex items-center gap-1 text-[10px]">
                              <Eye className="h-3 w-3" />
                              <span>{viewCount || 0} lượt xem</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                );

                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
                    {externalUrl ? (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col h-full cursor-pointer"
                      >
                        {cardContent}
                      </a>
                    ) : (
                      <Link href={`/news/${item.slug || (item as any).Slug}`} className="flex flex-col h-full cursor-pointer">
                        {cardContent}
                      </Link>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="safety" className="space-y-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Thông tin an toàn</AlertTitle>
            <AlertDescription>
              Tin tức tổng hợp từ {sources.length} nguồn: {sources.join(", ")}.
            </AlertDescription>
          </Alert>

          {paginatedAbductionArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Không có tin tức nào</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAbductionArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">
                      {article.imageUrl && (
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Hide image container if image fails to load
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) parent.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{article.source}</Badge>
                          <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {article.description}
                        </p>
                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground border-t">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{dayjs(article.publishedDate).format("DD/MM/YYYY HH:mm")}</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            <span>Chi tiết</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </CardContent>
                    </a>
                  </Card>
                ))}
              </div>

              {!searchQuery && abductionTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setAbductionPage(p => Math.max(1, p - 1))}
                    disabled={abductionPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Trang trước
                  </Button>
                  <span className="text-sm">Trang {abductionPage} / {abductionTotalPages}</span>
                  <Button
                    variant="outline"
                    onClick={() => setAbductionPage(p => Math.min(abductionTotalPages, p + 1))}
                    disabled={abductionPage >= abductionTotalPages}
                  >
                    Trang sau <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div >
  )
}
