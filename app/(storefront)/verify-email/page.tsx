"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

type VerifyStatus = "idle" | "verifying" | "success" | "error"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<VerifyStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    // Lấy email từ localStorage nếu có
    if (typeof window !== "undefined") {
      const pendingEmail = localStorage.getItem("pendingVerificationEmail")
      if (pendingEmail) {
        setEmail(pendingEmail)
      }
    }

    // Kiểm tra token từ URL
    const token = searchParams.get("token")
    const registered = searchParams.get("registered")

    if (token) {
      // Tự động verify nếu có token
      handleVerify(token)
    } else if (registered === "true") {
      // Nếu vừa đăng ký, hiển thị thông báo chờ verify
      setStatus("idle")
    }
  }, [searchParams])

  const handleVerify = async (token: string) => {
    setStatus("verifying")
    setErrorMessage(null)

    try {
      const result = await authApi.verifyEmail({ token })

      if (result.success) {
        setStatus("success")
        // Xóa email khỏi localStorage sau khi verify thành công
        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingVerificationEmail")
        }

        toast({
          title: "Xác thực thành công! ✅",
          description: "Email của bạn đã được xác thực thành công",
        })

        // Tự động redirect đến login sau 3 giây
        setTimeout(() => {
          router.push("/?verified=true")
        }, 3000)
      } else {
        setStatus("error")
        setErrorMessage("Token không hợp lệ hoặc đã hết hạn.")
      }
    } catch (err: any) {
      setStatus("error")
      const errorMsg = err.message || "Xác thực email thất bại. Vui lòng thử lại."
      setErrorMessage(errorMsg)
      toast({
        title: "Xác thực thất bại",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage("Vui lòng nhập email của bạn.")
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email của bạn",
        variant: "destructive",
      })
      return
    }

    setResendLoading(true)
    setErrorMessage(null)
    setResendSuccess(false)

    try {
      const result = await authApi.resendVerification(email)

      if (result.success) {
        setResendSuccess(true)
        if (typeof window !== "undefined") {
          localStorage.setItem("pendingVerificationEmail", email)
        }
        toast({
          title: "Email đã được gửi lại! ✅",
          description: "Vui lòng kiểm tra hộp thư đến của bạn",
        })
      }
    } catch (err: any) {
      const errorMsg = err.message || "Gửi lại email thất bại. Vui lòng thử lại."
      setErrorMessage(errorMsg)
      toast({
        title: "Gửi lại email thất bại",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 py-12 px-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-pink-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-pink-600">
            ✨ Xác thực Email ✨
          </CardTitle>
          <p className="text-muted-foreground mt-2">ARTEMIS Shop</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "idle" && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Kiểm tra email của bạn!</h2>
                <p className="text-muted-foreground">
                  Chúng tôi đã gửi link xác thực đến email của bạn.
                  Vui lòng kiểm tra hộp thư đến và nhấp vào link để xác thực tài khoản.
                </p>
                <p className="text-sm text-muted-foreground">
                  ⚠️ Link xác thực sẽ hết hạn sau 24 giờ.
                </p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Không nhận được email?
                </p>
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full"
                  />
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi lại email xác thực"
                    )}
                  </Button>
                  {resendSuccess && (
                    <p className="text-sm text-green-600 text-center">
                      ✅ Email đã được gửi lại thành công!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === "verifying" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-pink-600 mx-auto" />
              <p className="text-muted-foreground">Đang xác thực email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-green-600">
                  ✅ Xác thực thành công!
                </h2>
                <p className="text-muted-foreground">
                  Email của bạn đã được xác thực thành công.
                  Bạn có thể đăng nhập ngay bây giờ.
                </p>
                <p className="text-sm text-muted-foreground">
                  Đang chuyển đến trang chủ...
                </p>
              </div>
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500"
              >
                Về trang chủ
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-red-600">
                  ❌ Xác thực thất bại
                </h2>
                <p className="text-muted-foreground">
                  {errorMessage || "Token không hợp lệ hoặc đã hết hạn."}
                </p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vui lòng yêu cầu gửi lại email xác thực:
                </p>
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full"
                  />
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi lại email xác thực"
                    )}
                  </Button>
                  {resendSuccess && (
                    <p className="text-sm text-green-600 text-center">
                      ✅ Email đã được gửi lại thành công!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}

