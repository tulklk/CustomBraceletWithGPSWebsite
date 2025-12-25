import { Suspense } from "react"
import { ProductsContent } from "./ProductsContent"

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container py-8 md:py-12 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}

