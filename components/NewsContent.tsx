"use client"

import { useEffect, useRef } from "react"
import DOMPurify from "dompurify"
import { API_BASE_URL } from "@/lib/constants"

interface NewsContentProps {
  content: string
}

export function NewsContent({ content }: NewsContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    // Sanitize HTML để tránh XSS attacks
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "img",
        "blockquote",
        "div",
        "span",
        "pre",
        "code",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style", "width", "height"],
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    })

    contentRef.current.innerHTML = sanitizedContent

    // Lazy load images và style
    const images = contentRef.current.querySelectorAll("img")
    images.forEach((img) => {
      img.loading = "lazy"
      img.style.maxWidth = "100%"
      img.style.height = "auto"
      img.style.borderRadius = "8px"
      img.style.margin = "20px 0"
      img.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"
      img.style.display = "block"
      
      // Handle relative URLs - convert to absolute URL nếu cần
      if (img.src && img.src.startsWith("/uploads/")) {
        // URL là relative path từ backend
        // Convert sang absolute URL để load từ backend domain
        const absoluteUrl = `${API_BASE_URL}${img.src}`
        img.src = absoluteUrl
      }
    })
  }, [content])

  return (
    <div
      ref={contentRef}
      className="news-content prose prose-lg max-w-none 
                 prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-4
                 prose-p:mb-4 prose-p:leading-relaxed
                 prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                 prose-img:rounded-lg prose-img:shadow-lg prose-img:my-5
                 prose-strong:font-semibold
                 prose-ul:list-disc prose-ol:list-decimal
                 prose-li:my-2
                 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                 dark:prose-invert"
    />
  )
}

