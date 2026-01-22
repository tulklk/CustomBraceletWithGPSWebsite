"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { useCart } from "@/store/useCart"
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
import { Mail, Lock, User, Chrome, Eye, EyeOff, Facebook, Phone } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FacebookLoginButton from "@/components/auth/FacebookLoginButton"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const { setAuth } = useUser()
  const { fetchCart } = useCart()
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

      // Fetch full user info including isActive from /me endpoint
      let isActive: boolean | undefined = authResponse.user.isActive
      if (isActive === undefined && authResponse.accessToken) {
        try {
          const meResponse = await authApi.getMe(authResponse.accessToken)
          isActive = meResponse.isActive
        } catch (error) {
          // If /me fails, proceed with login but log warning
          console.warn("Failed to fetch user details:", error)
        }
      }

      // Check if account is active (explicitly check for false, undefined/null means active)
      if (isActive === false) {
        toast({
          title: "Tài khoản đã bị khóa",
          description: "Tài khoản của bạn đã bị khóa, liên hệ admin",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Update authResponse with isActive if we fetched it from /me
      if (isActive !== undefined && authResponse.user.isActive === undefined) {
        authResponse.user.isActive = isActive
      }

      setAuth(authResponse)

      // Fetch cart from backend after login
      try {
        await fetchCart()
      } catch (error) {
        console.warn("Failed to fetch cart after login:", error)
      }

      toast({
        title: "Đăng nhập thành công! 🎉",
        description: `Chào mừng trở lại, ${authResponse.user.fullName}`,
      })

      onOpenChange(false)
      resetForm()

      // Redirect if admin (after closing modal)
      if (authResponse.user.role === 1) {
        router.push("/admin")
        return
      }
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
    if (!email || !password || !confirmPassword || !name || !phoneNumber) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu và xác nhận mật khẩu không khớp",
        variant: "destructive",
      })
      return
    }

    // Validate password length
    if (password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      })
      return
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      toast({
        title: "Lỗi",
        description: "Số điện thoại không hợp lệ (10-11 chữ số)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await authApi.register({
        email,
        password,
        confirmPassword,
        fullName: name,
        phoneNumber: phoneNumber.replace(/\s/g, ""), // Remove spaces from phone number
      })

      // Lưu email vào localStorage để có thể resend verification
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingVerificationEmail', email)
      }

      toast({
        title: "Đăng ký thành công! 🎉",
        description: "Vui lòng kiểm tra email để xác thực tài khoản",
      })

      onOpenChange(false)
      resetForm()

      // Redirect đến trang verify-email
      router.push('/verify-email?registered=true')
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

      // Fetch full user info including isActive from /me endpoint
      let isActive: boolean | undefined = authResponse.user.isActive
      if (isActive === undefined && authResponse.accessToken) {
        try {
          const meResponse = await authApi.getMe(authResponse.accessToken)
          isActive = meResponse.isActive
        } catch (error) {
          // If /me fails, proceed with login but log warning
          console.warn("Failed to fetch user details:", error)
        }
      }

      // Check if account is active (explicitly check for false, undefined/null means active)
      if (isActive === false) {
        toast({
          title: "Tài khoản đã bị khóa",
          description: "Tài khoản của bạn đã bị khóa, liên hệ admin",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Update authResponse with isActive if we fetched it from /me
      if (isActive !== undefined && authResponse.user.isActive === undefined) {
        authResponse.user.isActive = isActive
      }

      setAuth(authResponse)

      // Fetch cart from backend after Google sign in
      try {
        await fetchCart()
      } catch (error) {
        console.warn("Failed to fetch cart after Google sign in:", error)
      }

      toast({
        title: "Đăng nhập thành công! 🎉",
        description: `Chào mừng ${authResponse.user.fullName}`,
      })

      onOpenChange(false)
      resetForm()

      // Redirect if admin (after closing modal)
      if (authResponse.user.role === 1) {
        router.push("/admin")
        return
      }
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
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured")
      return
    }

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id) {
        console.error("Google Identity Services not available")
        return
      }

      if (!googleSignInButtonRef.current) {
        console.error("Google button ref not available")
        return
      }

      try {
        // Clear any existing button
        googleSignInButtonRef.current.innerHTML = ''

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        })

        // Render Google Sign-In button into the hidden ref
        window.google.accounts.id.renderButton(googleSignInButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        })

        setGoogleScriptLoaded(true)
        console.log("Google Sign-In initialized successfully")
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error)
        setGoogleScriptLoaded(false)
      }
    }

    // Check if already loaded
    if (window.google?.accounts?.id) {
      setTimeout(initializeGoogleSignIn, 200)
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existingScript) {
      // Wait for script to load
      let attempts = 0
      const maxAttempts = 50 // 5 seconds
      const checkInterval = setInterval(() => {
        attempts++
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval)
          setTimeout(initializeGoogleSignIn, 200)
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
          console.error("Timeout waiting for Google Identity Services")
        }
      }, 100)

      return () => clearInterval(checkInterval)
    }

    // Load script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      // Wait a bit for Google API to be fully ready
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          initializeGoogleSignIn()
        } else {
          console.error("Google Identity Services API not available after script load")
        }
      }, 300)
    }
    script.onerror = (error) => {
      console.error("Failed to load Google Identity Services script:", error)
      setGoogleScriptLoaded(false)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup if component unmounts
      setGoogleScriptLoaded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Handle Google login button click - trigger sign-in popup directly
  const handleGoogleLoginClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      toast({
        title: "Lỗi cấu hình",
        description: "Google Client ID chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
        variant: "destructive",
      })
      return
    }

    if (!window.google?.accounts?.id) {
      toast({
        title: "Đang tải...",
        description: "Vui lòng đợi Google Sign-In tải xong và thử lại",
        variant: "default",
      })

      // Check if script is loading, if not, try to load it
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
          setTimeout(() => {
            if (window.google?.accounts?.id) {
              setGoogleScriptLoaded(true)
              // Trigger click again after script loads
              const button = googleSignInButtonRef.current?.querySelector('div[role="button"]') as HTMLElement
              if (button) {
                button.click()
              } else {
                // Re-initialize and render
                window.google.accounts.id.initialize({
                  client_id: clientId,
                  callback: handleGoogleCredentialResponse,
                })
                if (googleSignInButtonRef.current) {
                  googleSignInButtonRef.current.innerHTML = ''
                  window.google.accounts.id.renderButton(googleSignInButtonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                  })
                  setTimeout(() => {
                    const newButton = googleSignInButtonRef.current?.querySelector('div[role="button"]') as HTMLElement
                    newButton?.click()
                  }, 200)
                }
              }
            }
          }, 300)
        }
        document.head.appendChild(script)
      }
      return
    }

    setIsLoading(true)

    // Function to trigger sign-in
    const triggerSignIn = (): boolean => {
      if (!googleSignInButtonRef.current || !window.google?.accounts?.id) {
        return false
      }

      try {
        // Try to find and click the rendered button
        const button = googleSignInButtonRef.current.querySelector('div[role="button"]') as HTMLElement
        if (button) {
          button.click()
          return true
        }

        // If button not found, try to re-render it
        googleSignInButtonRef.current.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        })
        window.google.accounts.id.renderButton(googleSignInButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        })

        // Wait a bit and try clicking again
        setTimeout(() => {
          const newButton = googleSignInButtonRef.current?.querySelector('div[role="button"]') as HTMLElement
          if (newButton) {
            newButton.click()
          } else {
            setIsLoading(false)
            toast({
              title: "Lỗi",
              description: "Không thể render Google Sign-In button. Vui lòng refresh trang và thử lại.",
              variant: "destructive",
            })
          }
        }, 300)
        return true
      } catch (error) {
        console.error("Error triggering Google Sign-In:", error)
        return false
      }
    }

    // Try to trigger sign-in
    if (!triggerSignIn()) {
      // Retry after a short delay
      setTimeout(() => {
        if (!triggerSignIn()) {
          setIsLoading(false)
          toast({
            title: "Lỗi",
            description: "Không thể khởi tạo Google Sign-In. Vui lòng refresh trang và thử lại.",
            variant: "destructive",
          })
        }
      }, 500)
    }
  }

  const handleFacebookLoginSuccess = (user: any) => {
    // Redirect if admin
    if (user?.role === 1) {
      router.push("/admin")
    }
    onOpenChange(false)
    resetForm()
  }

  const handleForgotPasswordClick = () => {
    // Pre-fill email nếu đã nhập trong login form
    if (email) {
      setForgotPasswordEmail(email)
    }
    setForgotPasswordOpen(true)
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email của bạn",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotPasswordEmail.trim())) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      })
      return
    }

    setForgotPasswordLoading(true)
    try {
      await authApi.forgotPassword({ email: forgotPasswordEmail.trim() })
      toast({
        title: "Đã gửi email",
        description: "Vui lòng kiểm tra hộp thư email để đặt lại mật khẩu. Nếu không thấy email, vui lòng kiểm tra thư mục spam.",
      })
      setForgotPasswordOpen(false)
      setForgotPasswordEmail("")
    } catch (error) {
      const apiError = error as ApiError
      toast({
        title: "Gửi email thất bại",
        description: apiError.message || "Có lỗi xảy ra, vui lòng thử lại sau",
        variant: "destructive",
      })
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setName("")
    setPhoneNumber("")
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[480px] mx-2 sm:mx-auto">
        <div className="p-3 sm:p-6">
          {/* Hidden div for Google Sign-In button */}
          <div ref={googleSignInButtonRef} style={{ position: 'fixed', left: '-9999px', opacity: 0, pointerEvents: 'none' }} />

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-6">
            <Button
              variant="outline"
              className="h-9 sm:h-12 text-xs sm:text-base font-semibold hover:bg-accent hover:border-primary transition-all"
              onClick={handleGoogleLoginClick}
              disabled={isLoading || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
              title={!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Vui lòng cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env.local" : undefined}
            >
              {isLoading ? (
                <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Chrome className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-red-500" />
                  Google
                </>
              )}
            </Button>

            <FacebookLoginButton
              onSuccess={handleFacebookLoginSuccess}
              className="h-9 sm:h-12 text-xs sm:text-base font-semibold"
            />
          </div>

          <div className="relative mb-3 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc
              </span>
            </div>
          </div>

          {/* Login/Register Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-6 h-9 sm:h-10">
              <TabsTrigger value="login" className="text-xs sm:text-sm">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register" className="text-xs sm:text-sm">Đăng ký</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="login-email" className="text-xs sm:text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="login-password" className="text-xs sm:text-sm">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-10 text-xs sm:text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-[10px] sm:text-sm text-primary hover:underline"
                    onClick={handleForgotPasswordClick}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <Button type="submit" className="w-full h-9 sm:h-11 text-xs sm:text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-base">Đang đăng nhập...</span>
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="register-name" className="text-xs sm:text-sm">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      placeholder="Nguyễn Văn A"
                      className="pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="register-email" className="text-xs sm:text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="register-phone" className="text-xs sm:text-sm">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="0901234567"
                      className="pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="register-password" className="text-xs sm:text-sm">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-10 text-xs sm:text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-xs sm:text-sm">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-8 sm:pl-10 pr-8 sm:pr-10 h-9 sm:h-10 text-xs sm:text-sm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] sm:text-xs text-red-500">Mật khẩu không khớp</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-9 sm:h-11 text-xs sm:text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-base">Đang đăng ký...</span>
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>

                <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
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

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[420px] mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Quên mật khẩu</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-xs sm:text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="email@example.com"
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  disabled={forgotPasswordLoading}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForgotPasswordOpen(false)
                  setForgotPasswordEmail("")
                }}
                disabled={forgotPasswordLoading}
                className="h-9 sm:h-10 text-xs sm:text-sm"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={forgotPasswordLoading}
                className="h-9 sm:h-10 text-xs sm:text-sm"
              >
                {forgotPasswordLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi email"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

