import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/Logo"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 mt-12 md:mt-20">
      <div className="container py-8 md:py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Vòng tay thông minh giúp phụ huynh an tâm theo dõi con yêu mọi lúc mọi nơi.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:contact@artemis.vn">contact@artemis.vn</a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+84924512422">0924 512 422</a>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/products?category=${encodeURIComponent("Vòng tay thông minh")}`} className="text-muted-foreground hover:text-primary transition-colors">
                  ARTEMIS Vòng tay thông minh
                </Link>
              </li>
              <li>
                <Link href={`/products?category=${encodeURIComponent("Dây chuyền")}`} className="text-muted-foreground hover:text-primary transition-colors">
                  ARTEMIS Dây chuyền
                </Link>
              </li>
              <li>
                <Link href={`/products?category=${encodeURIComponent("Pin kẹp quần áo")}`} className="text-muted-foreground hover:text-primary transition-colors">
                  ARTEMIS Pin kẹp
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-primary transition-colors">
                  Hướng dẫn
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-primary transition-colors">
                  Bảo hành
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Chính sách</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Bảo mật dữ liệu
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                  Đổi trả
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 ARTEMIS. All rights reserved.</p>
          <p>Made with ❤️ for kids safety</p>
        </div>
      </div>
    </footer>
  )
}

