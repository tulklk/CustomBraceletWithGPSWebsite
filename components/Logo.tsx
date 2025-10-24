import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
      {/* Logo Icon - Guardian Angel Image */}
      <div className="relative w-[50px] h-[70px] flex-shrink-0">
        <Image
          src="/logo ARTEMIS trắng.png"
          alt="ARTEMIS Guardian Angel Logo"
          fill
          className="object-contain"
          style={{
            filter: 'brightness(0) saturate(100%) invert(47%) sepia(95%) saturate(4786%) hue-rotate(308deg) brightness(97%) contrast(91%)'
          }}
          priority
        />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold leading-tight bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
            ARTEMIS
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            Guardian Bracelets
          </span>
        </div>
      )}
    </Link>
  )
}

