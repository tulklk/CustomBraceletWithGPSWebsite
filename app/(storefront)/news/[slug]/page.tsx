"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { newsApi } from "@/lib/api/news"
import { NewsDto } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { Calendar, Eye, User, ArrowLeft, Facebook, Twitter } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { NewsContent } from "@/components/NewsContent"
dayjs.locale("vi")

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [news, setNews] = useState<NewsDto | null>(null)
  const [relatedNews, setRelatedNews] = useState<NewsDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchNews()
    }
  }, [slug])

  const fetchNews = async () => {
    try {
      setLoading(true)
      // Fetch news detail (will increment view count)
      const newsData = await newsApi.getById(slug, true)
      if (!newsData) {
        router.push("/news")
        return
      }
      setNews(newsData)

      // Fetch related news (same category, exclude current)
      if (newsData.category) {
        const allNews = await newsApi.getAll({
          category: newsData.category,
          pageSize: 5,
        })
        const related = allNews
          .filter((item) => item.id !== newsData.id)
          .slice(0, 3)
        setRelatedNews(related)
      }
    } catch (error: any) {
      console.error("Error fetching news:", error)
      if (error.statusCode === 404) {
        router.push("/news")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleShare = (platform: "facebook" | "twitter") => {
    if (!news) return
    const url = window.location.href
    const text = news.title

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      )
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        "_blank"
      )
    }
  }

  if (loading) {
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

  if (!news) {
    return (
      <div className="container py-8 md:py-12 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            Không tìm thấy tin tức
          </p>
          <Button asChild>
            <Link href="/news">Quay lại danh sách tin tức</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12 px-4">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/news">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách tin tức
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article>
            {/* Header */}
            <div className="mb-6">
              {news.category && (
                <Badge variant="outline" className="mb-3">
                  {news.category}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {news.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {news.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {dayjs(news.publishedAt).format("DD [tháng] MM, YYYY [lúc] HH:mm")}
                    </span>
                  </div>
                )}
                {news.authorName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{news.authorName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{news.viewCount || 0} lượt xem</span>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            {news.thumbnailUrl && (
              <div className="mb-6 aspect-video relative overflow-hidden rounded-lg bg-muted">
                <Image
                  src={news.thumbnailUrl}
                  alt={news.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {news.tags && (
              <div className="mb-6 flex flex-wrap gap-2">
                {news.tags.split(",").map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}

            {/* Summary */}
            {news.summary && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-lg font-medium">{news.summary}</p>
              </div>
            )}

            {/* Content */}
            <NewsContent content={news.content} />

            {/* Share Buttons */}
            <Separator className="my-8" />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Chia sẻ:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Related News */}
          {relatedNews.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Tin tức liên quan</h2>
                <div className="space-y-4">
                  {relatedNews.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {item.thumbnailUrl && (
                          <div className="w-20 h-20 relative flex-shrink-0 rounded overflow-hidden bg-muted">
                            <Image
                              src={item.thumbnailUrl}
                              alt={item.title}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          {item.publishedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {dayjs(item.publishedAt).format("DD/MM/YYYY")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

