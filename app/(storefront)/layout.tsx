import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ChatWidget } from "@/components/Chat/ChatWidget"
import { FilterWidget } from "@/components/FilterWidget"
import { FilterProvider } from "@/contexts/FilterContext"

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <FilterWidget />
      </div>
    </FilterProvider>
  )
}

