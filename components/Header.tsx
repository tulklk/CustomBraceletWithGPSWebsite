"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Moon, Sun, User, ChevronDown, Settings, History, Heart, LogOut } from "lucide-react"
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
import { useState } from "react"
import { CartDrawer } from "./CartDrawer"
import { AuthModal } from "./AuthModal"
import { Logo } from "@/components/Logo"

export function Header() {
  const { getTotalItems } = useCart()
  const { user, logout } = useUser()
  const { setTheme, theme } = useTheme()
  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const totalItems = getTotalItems()

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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3 md:gap-6">
            <Logo className="scale-75 md:scale-100" />
            
            <nav className="hidden md:flex gap-6">
              <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                Sản phẩm
              </Link>
              <Link href="/faq" className="text-sm font-medium hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/guides" className="text-sm font-medium hover:text-primary transition-colors">
                Hướng dẫn
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
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

            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 md:h-10 md:w-10"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-[18px] w-[18px] md:h-5 md:w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-auto px-2 py-1.5 md:px-3 md:py-2 hover:bg-accent rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-pink-400 dark:border-pink-500 overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        {user.avatar && !avatarError ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar}
                            alt={getUserDisplayName()}
                            className="w-full h-full object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600">
                            <span className="text-white text-sm font-semibold">
                              {getUserInitials()}
                            </span>
                          </div>
                        )}
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
                    <Link href="/account?tab=favorites" className="flex items-center gap-2 cursor-pointer">
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
              <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => setAuthOpen(true)}>
                Đăng nhập
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 px-4 flex flex-col gap-3">
              <Link
                href="/products"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/guides"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hướng dẫn
              </Link>
              {!user && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start mt-2" 
                  onClick={() => {
                    setAuthOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}
