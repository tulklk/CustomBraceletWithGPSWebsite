"use client"

import { useMemo, useRef, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { adminApi } from "@/lib/api/admin"
import { useUser } from "@/store/useUser"
import { useToast } from "@/hooks/use-toast"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Nhập nội dung..." }: RichTextEditorProps) {
  const quillInstanceRef = useRef<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useUser()

  // Get Quill instance from DOM
  const getQuill = () => {
    if (quillInstanceRef.current) {
      return quillInstanceRef.current
    }
    // Try to get from DOM
    if (editorContainerRef.current) {
      const editorElement = editorContainerRef.current.querySelector(".ql-editor")
      if (editorElement) {
        // @ts-ignore - Quill instance is attached to the element
        const quill = editorElement.__quill || (window as any).Quill?.find(editorElement)
        if (quill) {
          quillInstanceRef.current = quill
          return quill
        }
      }
    }
    return null
  }

  // Custom image handler
  const imageHandler = useCallback(() => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh phải nhỏ hơn 10MB",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Lỗi",
          description: "File phải là ảnh",
          variant: "destructive",
        })
        return
      }

      // Check allowed formats
      const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!allowedFormats.includes(file.type.toLowerCase())) {
        toast({
          title: "Lỗi",
          description: "Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPG, PNG, GIF, WEBP",
          variant: "destructive",
        })
        return
      }

      if (!user?.accessToken) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        })
        return
      }

      try {
        // Get Quill instance
        const quill = getQuill()
        if (!quill) {
          toast({
            title: "Lỗi",
            description: "Editor chưa sẵn sàng, vui lòng thử lại",
            variant: "destructive",
          })
          return
        }

        const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 }
        quill.insertText(range.index, "Đang upload ảnh...", "user")
        quill.setSelection(range.index + 20)

        // Upload to API
        const result = await adminApi.news.uploadImage(user.accessToken, file)

        // Remove loading text and insert image
        quill.deleteText(range.index, 20)
        // URL từ API là relative path: /uploads/news/{filename}
        // Browser sẽ tự động resolve relative path
        quill.insertEmbed(range.index, "image", result.url)
        quill.setSelection(range.index + 1)

        toast({
          title: "Thành công",
          description: "Đã upload ảnh thành công",
        })
      } catch (error: any) {
        toast({
          title: "Lỗi upload",
          description: error.message || "Không thể upload ảnh",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler, user?.accessToken]
  )

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "align",
    "link",
    "image",
    "video",
  ]

  // Store Quill instance when editor is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editorContainerRef.current) {
        const editorElement = editorContainerRef.current.querySelector(".ql-editor")
        if (editorElement) {
          // @ts-ignore - Quill instance is attached to the element
          const quill = editorElement.__quill || (window as any).Quill?.find(editorElement)
          if (quill) {
            quillInstanceRef.current = quill
          }
        }
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="rich-text-editor" ref={editorContainerRef}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background"
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 300px;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          background: hsl(var(--background));
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .rich-text-editor .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .rich-text-editor .ql-fill {
          fill: hsl(var(--foreground));
        }
        .rich-text-editor .ql-picker-label {
          color: hsl(var(--foreground));
        }
        .rich-text-editor .ql-picker-options {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
        }
        .rich-text-editor .ql-picker-item:hover {
          background: hsl(var(--accent));
        }
        .rich-text-editor .ql-picker-item.ql-selected {
          background: hsl(var(--accent));
        }
      `}</style>
    </div>
  )
}

