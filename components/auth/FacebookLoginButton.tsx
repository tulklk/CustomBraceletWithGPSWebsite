"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUser } from "@/store/useUser"
import { useCart } from "@/store/useCart"
import { authApi } from "@/lib/api/auth"
import { initFacebookSDK } from "@/lib/facebook"
import { useToast } from "@/hooks/use-toast"

interface FacebookLoginButtonProps {
  onSuccess?: () => void
  className?: string
}

export default function FacebookLoginButton({ 
  onSuccess,
  className = ""
}: FacebookLoginButtonProps) {
  const { setAuth } = useUser()
  const { fetchCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSDKReady, setIsSDKReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Facebook SDK on mount with retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const initializeSDK = () => {
    initFacebookSDK()
      .then(() => {
        setIsSDKReady(true)
          setError(null)
      })
      .catch((err) => {
        console.error("Failed to initialize Facebook SDK:", err)
          
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(() => {
              initializeSDK()
            }, retryDelay)
          } else {
            setError("Không thể tải Facebook login. Vui lòng kiểm tra kết nối và làm mới trang.")
          }
        })
    }

    initializeSDK()
  }, [])

  const handleFacebookLogin = () => {
    // Double check SDK is ready
    if (!window.FB) {
      // Try to initialize again (don't await, handle asynchronously)
      initFacebookSDK()
        .then(() => {
          setIsSDKReady(true)
        })
        .catch((err) => {
          setError("Facebook SDK chưa sẵn sàng. Vui lòng đợi hoặc làm mới trang.")
        })
      return
    }

    setIsLoading(true)
    setError(null)

    // Define async handler separately (not as callback)
    const handleLoginResponse = async (response: any) => {
        try {
          if (response.status === "connected" && response.authResponse) {
            const accessToken = response.authResponse.accessToken

            // Call backend API with Facebook access token
            const authResponse = await authApi.loginWithFacebook({ accessToken })
            
            // Fetch full user info including isActive from /me endpoint
            let isActive: boolean | undefined = authResponse.user.isActive
            if (isActive === undefined && authResponse.accessToken) {
              try {
                const meResponse = await authApi.getMe(authResponse.accessToken)
                isActive = meResponse.isActive
              } catch (error) {
                console.warn("Failed to fetch user details:", error)
              }
            }
            
            // Check if account is active
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
            
            // Store tokens and user info
            setAuth(authResponse)
            
            // Fetch cart after login
            try {
              await fetchCart()
            } catch (cartError) {
              console.warn("Failed to fetch cart after login:", cartError)
            }
            
            toast({
              title: "Đăng nhập thành công!",
              description: `Chào mừng ${authResponse.user.fullName}`,
            })
            
            // Call onSuccess callback if provided
            if (onSuccess) {
              onSuccess()
            } else {
              // Redirect to home
              router.push("/")
            }
          } else {
            throw new Error("Đăng nhập Facebook bị hủy hoặc thất bại")
          }
        } catch (err: any) {
          console.error("Facebook login error:", err)
          const errorMessage = err?.message || "Không thể đăng nhập với Facebook"
          
          // Handle specific error cases
          if (err?.statusCode === 401) {
            setError("Token Facebook không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.")
          } else if (errorMessage.includes("email")) {
            setError("Tài khoản Facebook của bạn không có email. Vui lòng sử dụng phương thức đăng nhập khác.")
          } else {
            setError(errorMessage)
          }
          
          toast({
            title: "Lỗi đăng nhập",
            description: errorMessage,
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
    }

    // Use regular function (not async) as callback for FB.login
    window.FB.login(
      (response) => {
        // Call async handler and catch any errors
        handleLoginResponse(response).catch((err) => {
          console.error("Unhandled error in handleLoginResponse:", err)
          setIsLoading(false)
          setError("Đã xảy ra lỗi không mong đợi. Vui lòng thử lại.")
        })
      },
      {
        scope: "email,public_profile", // Request email and public profile permissions
      }
    )
  }

  return (
    <div className="facebook-login-wrapper w-full">
      <Button
        type="button"
        onClick={handleFacebookLogin}
        disabled={isLoading || !isSDKReady}
        variant="outline"
        className={`
          w-full flex items-center justify-center gap-2
          h-12 text-base font-semibold hover:bg-accent hover:border-primary transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </>
        )}
      </Button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
      
      {!isSDKReady && !error && (
        <p className="mt-2 text-sm text-gray-500 text-center">Đang tải Facebook login...</p>
      )}
    </div>
  )
}

