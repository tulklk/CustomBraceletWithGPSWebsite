"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/store/useUser"
import { useToast } from "@/hooks/use-toast"
import { authApi, ApiError } from "@/lib/api/auth"
// Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
        }
        oauth2: {
          initTokenClient: (config: any) => any
        }
      }
    }
  }
}
import { Mail, Lock, User, Chrome, Eye, EyeOff, Facebook } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const { setAuth } = useUser()
  const { toast } = useToast()
  const googleSignInButtonRef = useRef<HTMLDivElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const authResponse = await authApi.login({ email, password })
      setAuth(authResponse)
      toast({
        title: "Đăng nhập thành công! 🎉",
        description: `Chào mừng trở lại, ${authResponse.user.fullName}`,
      })
      onOpenChange(false)
      resetForm()
    } catch (error) {
      const apiError = error as ApiError
      toast({
        title: "Đăng nhập thất bại",
        description: apiError.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const authResponse = await authApi.register({
        email,
        password,
        fullName: name,
      })
      setAuth(authResponse)
      toast({
        title: "Đăng ký thành công! 🎉",
        description: `Chào mừng ${name} đến với ARTEMIS`,
      })
      onOpenChange(false)
      resetForm()
    } catch (error) {
      const apiError = error as ApiError
      toast({
        title: "Đăng ký thất bại",
        description: apiError.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google credential response (ID token from Google Identity Services)
  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true)
    try {
      // response.credential is the ID token (JWT) from Google Identity Services
      // Send id_token to backend to verify and get user info + access token
      const authResponse = await authApi.verifyGoogleToken({
        idToken: response.credential,
      })
      setAuth(authResponse)
      toast({
        title: "Đăng nhập thành công! 🎉",
        description: `Chào mừng ${authResponse.user.fullName}`,
      })
      onOpenChange(false)
      resetForm()
    } catch (error) {
      const apiError = error as ApiError
      toast({
        title: "Đăng nhập thất bại",
        description: apiError.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load Google Identity Services script when modal opens
  useEffect(() => {
    if (!open) {
      setGoogleScriptLoaded(false)
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id || !googleSignInButtonRef.current) return
      
      // Clear any existing button
      googleSignInButtonRef.current.innerHTML = ''
      
      setGoogleScriptLoaded(true)
      
      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      })

      // Render Google Sign-In button into the hidden ref
      try {
        window.google.accounts.id.renderButton(googleSignInButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        })
      } catch (error) {
        console.error("Error rendering Google button:", error)
      }
    }

    // Check if already loaded
    if (window.google?.accounts?.id) {
      // Wait a bit for DOM to be ready
      setTimeout(initializeGoogleSignIn, 100)
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existingScript) {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval)
          setTimeout(initializeGoogleSignIn, 100)
        }
      }, 100)
      
      setTimeout(() => clearInterval(checkInterval), 5000)
      return
    }

    // Load script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      setTimeout(initializeGoogleSignIn, 100)
    }
    script.onerror = () => {
      console.error("Failed to load Google Identity Services")
    }
    document.head.appendChild(script)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Handle Google login button click - trigger sign-in popup directly
  const handleGoogleLoginClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    
    if (!clientId) {
      toast({
        title: "Lỗi cấu hình",
        description: "Google Client ID chưa được cấu hình",
        variant: "destructive",
      })
      return
    }

    if (!googleScriptLoaded || !window.google?.accounts?.id) {
      toast({
        title: "Đang tải...",
        description: "Vui lòng đợi Google Sign-In tải xong và thử lại",
        variant: "default",
      })
      return
    }

    setIsLoading(true)

    try {
      // Click on the rendered button in the hidden ref
      const button = googleSignInButtonRef.current?.querySelector('div[role="button"]') as HTMLElement
      if (button) {
        button.click()
      } else {
        setIsLoading(false)
        toast({
          title: "Lỗi",
          description: "Không thể khởi tạo Google Sign-In. Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error triggering Google Sign-In:", error)
      toast({
        title: "Đăng nhập thất bại",
        description: "Không thể khởi tạo Google Sign-In. Vui lòng thử lại.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    try {
      // Facebook login is not available in the backend API
      toast({
        title: "Chức năng chưa khả dụng",
        description: "Đăng nhập bằng Facebook chưa được hỗ trợ",
        variant: "default",
      })
    } catch (error) {
      const apiError = error as ApiError
      toast({
        title: "Đăng nhập thất bại",
        description: apiError.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email của bạn",
        variant: "destructive",
      })
      return
    }

    try {
      await authApi.forgotPassword({ email })
      toast({
        title: "Đã gửi email",
        description: "Vui lòng kiểm tra email để đặt lại mật khẩu",
      })
    } catch (error) {
      const apiError = error as ApiError
      toast({
        title: "Gửi email thất bại",
        description: apiError.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setShowPassword(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <div className="p-6">
          {/* Hidden div for Google Sign-In button */}
          <div ref={googleSignInButtonRef} style={{ position: 'fixed', left: '-9999px', opacity: 0, pointerEvents: 'none' }} />
          
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="h-12 text-base font-semibold hover:bg-accent hover:border-primary transition-all"
              onClick={handleGoogleLoginClick}
              disabled={isLoading || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
              title={!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Vui lòng cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env.local" : undefined}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2 text-red-500" />
                  Google
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="h-12 text-base font-semibold hover:bg-accent hover:border-primary transition-all"
              onClick={handleFacebookLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                  Facebook
                </>
              )}
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc
              </span>
            </div>
          </div>

          {/* Login/Register Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={handleForgotPassword}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      placeholder="Nguyễn Văn A"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Điều khoản
                  </a>{" "}
                  và{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Chính sách
                  </a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

