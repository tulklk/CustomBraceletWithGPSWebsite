"use client"

import { useMemo, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { useToast } from "@/hooks/use-toast"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Nhập nội dung..." }: RichTextEditorProps) {
  const quillRef = useRef<any>(null)
  const { toast } = useToast()

  // Load Quill CSS
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-quill/dist/quill.snow.css")
    }
  }, [])

  // Custom image handler
  const imageHandler = () => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh phải nhỏ hơn 5MB",
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

      try {
        // Show loading
        const quill = quillRef.current?.getEditor()
        if (!quill) return

        const range = quill.getSelection(true)
        quill.insertText(range.index, "Đang upload ảnh...", "user")
        quill.setSelection(range.index + 20)

        // Upload to Cloudinary
        const result = await uploadImageToCloudinary(file)

        // Remove loading text and insert image
        quill.deleteText(range.index, 20)
        quill.insertEmbed(range.index, "image", result.secure_url)
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
  }

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
    [toast]
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

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
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

