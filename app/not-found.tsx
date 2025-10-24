import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">
          Trang bạn tìm không tồn tại
        </p>
        <Button asChild size="lg">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  )
}

