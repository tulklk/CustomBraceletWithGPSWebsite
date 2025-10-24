"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle, Info, AlertCircle, Sparkles } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string | null, title?: React.ReactNode) => {
    // Check title for keywords
    const titleStr = typeof title === "string" ? title.toLowerCase() : ""
    
    if (variant === "destructive" || titleStr.includes("lỗi") || titleStr.includes("error")) {
      return <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
    }
    
    if (titleStr.includes("thành công") || titleStr.includes("success") || titleStr.includes("đã thêm") || titleStr.includes("đã lưu")) {
      return <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
    }
    
    if (titleStr.includes("giới hạn") || titleStr.includes("warning") || titleStr.includes("không")) {
      return <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
    }
    
    return <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = getIcon(variant, title)
        
        return (
          <Toast key={id} variant={variant as any} {...props}>
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-0.5">{icon}</div>
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

