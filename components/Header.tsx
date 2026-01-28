"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, Moon, Sun, User, ChevronDown, Settings, History, Heart, LogOut, Shield, X, Plus, Minus, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/store/useCart"
import { useUser } from "@/store/useUser"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CartDrawer } from "./CartDrawer"
import { CartPopup } from "./CartPopup"
import { AuthModal } from "./AuthModal"
import { Logo } from "@/components/Logo"
import { SearchBar } from "./SearchBar"
import { categoriesApi, Category } from "@/lib/api/categories"
import { cn, slugify } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Component to handle verified query param (needs Suspense)
function VerifiedToastHandler() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const verified = searchParams.get("verified")
    if (verified === "true") {
      toast({
        title: "Email đã được xác thực thành công! ✅",
        description: "Bạn có thể đăng nhập ngay bây giờ",
      })
      // Remove query parameter from URL
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        url.searchParams.delete("verified")
        window.history.replaceState({}, "", url.toString())
      }
    }
  }, [searchParams, toast])

  return null
}

export function Header() {
  const { getTotalItems, fetchCart } = useCart()
  const { user, logout } = useUser()
  const { toast } = useToast()
  
  // Fetch cart when user is logged in
  useEffect(() => {
    if (user?.accessToken) {
      fetchCart().catch((error) => {
        console.warn("Failed to fetch cart:", error)
      })
    }
  }, [user?.accessToken, fetchCart])

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar])
  
  const { setTheme, theme } = useTheme()
  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false)
  const [cartPopupOpen, setCartPopupOpen] = useState(false)
  const [mobileProductsExpanded, setMobileProductsExpanded] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const productsDropdownRef = useRef<HTMLDivElement>(null)
  const productsNavRef = useRef<HTMLDivElement>(null)
  const cartButtonRef = useRef<HTMLButtonElement>(null)

  const totalItems = getTotalItems()

  // Only render badge after client mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch categories (with caching)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Categories are automatically cached by categoriesApi.getAll()
        const data = await categoriesApi.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // No need for useEffect - we'll use onMouseEnter/onMouseLeave directly

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.name) return user.name[0].toUpperCase()
    if (user?.fullName) return user.fullName[0].toUpperCase()
    if (user?.email) return user.email[0].toUpperCase()
    return "U"
  }

  // Get user display name
  const getUserDisplayName = () => {
    return user?.name || user?.fullName || "User"
  }

  // Get avatar URL - handle Cloudinary URLs
  const getAvatarUrl = () => {
    if (!user?.avatar) return null
    
    // If it's already a full URL (http/https), return as is
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return user.avatar
    }
    
    // If it's already a Cloudinary URL (contains res.cloudinary.com), return as is
    if (user.avatar.includes('res.cloudinary.com')) {
      return user.avatar
    }
    
    // If it's a Cloudinary public_id or path, construct the URL
    // Try to get cloud name from env, or extract from existing URLs if available
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'
    
    // If it starts with /, it's a path - prepend Cloudinary base URL
    if (user.avatar.startsWith('/')) {
      return `https://res.cloudinary.com/${cloudName}/image/upload${user.avatar}`
    }
    
    // Otherwise, assume it's a public_id and construct URL
    // Remove any leading slashes
    const publicId = user.avatar.replace(/^\/+/, '')
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
  }

  return (
    <>
      <Suspense fallback={null}>
        <VerifiedToastHandler />
      </Suspense>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 gap-2 md:gap-4">
          <div className="flex items-center gap-0 md:gap-6 flex-shrink-0">
            {/* Burger Menu - Left Side (Mobile Only) */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0">
                <SheetHeader className="bg-primary text-primary-foreground px-4 py-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-white font-bold text-base sm:text-lg">
                      DANH MỤC SẢN PHẨM
                    </SheetTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col py-4">
                  <Link
                    href="/"
                    className="px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    TRANG CHỦ
                  </Link>
                  {/* SẢN PHẨM với expandable categories */}
                  <div>
                    <button
                      className="w-full px-4 py-3 text-sm font-medium hover:bg-accent transition-colors flex items-center justify-between text-left"
                      onClick={() => setMobileProductsExpanded(!mobileProductsExpanded)}
                    >
                      <span>SẢN PHẨM</span>
                      {mobileProductsExpanded ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                    {mobileProductsExpanded && categories.length > 0 && (
                      <div className="bg-muted/50">
                        {categories.map((category) => (
                          <Link
                            key={category.id || category.name}
                            href={`/products/category/${slugify(category.name)}`}
                            className="block px-8 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            onClick={() => {
                              setMobileMenuOpen(false)
                              setMobileProductsExpanded(false)
                            }}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href="/news"
                    className="px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    TIN TỨC
                  </Link>
                  <Link
                    href="/order-lookup"
                    className="px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    TRA CỨU ĐƠN HÀNG
                  </Link>
                  <Link
                    href="/guides"
                    className="px-4 py-3 text-sm font-medium hover:bg-accent transition-colors flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>HƯỚNG DẪN</span>
                  </Link>
                  <Link
                    href="/about"
                    className="px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    GIỚI THIỆU
                  </Link>
                  <Link
                    href="/contact"
                    className="px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    LIÊN HỆ
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Logo className="scale-75 md:scale-100" />
            
            <nav className="hidden md:flex gap-6">
              {/* Products Dropdown */}
              <div 
                ref={productsNavRef}
                className="relative"
                onMouseEnter={() => setProductsDropdownOpen(true)}
                onMouseLeave={() => setProductsDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                >
                  Sản phẩm
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    productsDropdownOpen && "rotate-180"
                  )} />
                </button>
                
                {/* Invisible bridge to prevent gap */}
                {productsDropdownOpen && (
                  <div className="absolute top-full left-0 w-full h-2" />
                )}
                
                {/* Dropdown Menu */}
                <div
                  ref={productsDropdownRef}
                  className={cn(
                    "absolute top-full left-0 mt-0 w-56 bg-background border rounded-lg shadow-lg z-50",
                    "transition-all duration-300 ease-out",
                    productsDropdownOpen
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 -translate-y-2 invisible"
                  )}
                >
                  <div className="py-2">
                    {categories.length > 0 && (
                      <>
                        {categories.map((category) => (
                          <Link
                            key={category.id || category.name}
                            href={`/products/category/${slugify(category.name)}`}
                            className="block px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => setProductsDropdownOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
                Tin tức
              </Link>
              <Link href="/faq" className="text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/guides" className="text-sm font-medium hover:text-primary transition-colors">
                Hướng dẫn
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                Giới thiệu
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Liên hệ
              </Link>
            </nav>
          </div>

          {/* Search Bar - Hidden on mobile, shown on md and up */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4 min-w-0">
            <SearchBar />
          </div>

          <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Tìm kiếm"
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>

            <Link 
              href="/order-lookup" 
              className="hidden md:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-accent"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden lg:inline">Tra cứu đơn hàng</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-[18px] w-[18px] md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[18px] w-[18px] md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <div 
              className="relative"
              onMouseEnter={() => setCartPopupOpen(true)}
              onMouseLeave={() => setCartPopupOpen(false)}
            >
              {/* Invisible bridge to prevent gap */}
              {cartPopupOpen && (
                <div className="absolute top-full right-0 w-full h-2" />
              )}
              
              <div className="relative">
                <Button
                  ref={cartButtonRef}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:h-10 md:w-10"
                  onClick={() => setCartOpen(true)}
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-[18px] w-[18px] md:h-5 md:w-5" />
                </Button>
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium z-10">
                    {totalItems}
                  </span>
                )}
              </div>
              <CartPopup
                open={cartPopupOpen}
                onClose={() => setCartPopupOpen(false)}
                triggerRef={cartButtonRef}
              />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-auto px-1 py-1.5 md:px-2 md:py-2 hover:bg-accent rounded-lg"
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      {/* Avatar */}
                      <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-pink-400 dark:border-pink-500 overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        {(() => {
                          const avatarUrl = getAvatarUrl()
                          if (avatarUrl && !avatarError) {
                            return (
                              <Image
                                src={avatarUrl}
                                alt={getUserDisplayName()}
                                fill
                                className="object-cover"
                                onError={() => setAvatarError(true)}
                                unoptimized
                              />
                            )
                          }
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600">
                              <span className="text-white text-sm font-semibold">
                                {getUserInitials()}
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                      {/* Name */}
                      <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getUserDisplayName()}
                      </span>
                      {/* Dropdown arrow */}
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Admin Menu Item - Only show for admin users (role === 1) */}
                  {user && user.role === 1 && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-4 w-4" />
                          Quản trị
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Quản lý tài khoản
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=orders" className="flex items-center gap-2 cursor-pointer">
                      <History className="h-4 w-4" />
                      Lịch sử đơn hàng
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=wishlist" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="h-4 w-4" />
                      Sản phẩm yêu thích
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      await logout()
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
                onClick={() => setAuthOpen(true)}
                aria-label="Đăng nhập"
              >
                <User className="h-[18px] w-[18px] md:h-5 md:w-5" />
              </Button>
            )}

          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 py-3">
              <SearchBar onAfterNavigate={() => setMobileSearchOpen(false)} />
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}
