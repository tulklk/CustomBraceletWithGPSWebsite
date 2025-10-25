import type { Metadata } from "next"
import { Inter, Caprasimo } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin", "vietnamese"] })
const caprasimo = Caprasimo({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caprasimo"
})

export const metadata: Metadata = {
  title: "ARTEMIS - Vòng tay thông minh cho trẻ em | GPS Tracking",
  description: "Tùy biến vòng tay định vị GPS theo cá tính - An tâm theo dõi con yêu mọi lúc mọi nơi. Chống nước, pin lâu, thiết kế đẹp.",
  keywords: "vòng tay trẻ em, GPS tracking, định vị trẻ em, ARTEMIS, vòng tay thông minh, guardian bracelets",
  authors: [{ name: "ARTEMIS Team" }],
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} ${caprasimo.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

