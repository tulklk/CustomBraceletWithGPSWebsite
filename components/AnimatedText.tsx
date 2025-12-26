"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedTextProps {
  text: string
  className?: string
}

export function AnimatedText({ text, className = "" }: AnimatedTextProps) {
  const [visibleChars, setVisibleChars] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<"typing" | "visible" | "erasing">("typing")

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (currentPhase === "typing") {
      // Type from left to right - fade in each character
      if (visibleChars < text.length) {
        timeoutId = setTimeout(() => {
          setVisibleChars(visibleChars + 1)
        }, 100) // Speed: 100ms per character
      } else {
        // Finished typing, wait 3 seconds then start erasing
        timeoutId = setTimeout(() => {
          setCurrentPhase("visible")
          setTimeout(() => {
            setCurrentPhase("erasing")
          }, 3000) // Show full text for 3 seconds
        }, 100)
      }
    } else if (currentPhase === "erasing") {
      // Erase from right to left - fade out each character
      if (visibleChars > 0) {
        timeoutId = setTimeout(() => {
          setVisibleChars(visibleChars - 1)
        }, 50) // Faster erasing: 50ms per character
      } else {
        // Finished erasing, restart typing after a brief pause
        timeoutId = setTimeout(() => {
          setCurrentPhase("typing")
        }, 500) // Pause 500ms before restarting
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [visibleChars, text, currentPhase])

  return (
    <h1 className={className}>
      {text.split("").map((char, index) => {
        const isVisible = index < visibleChars
        const isTyping = currentPhase === "typing" && index === visibleChars
        
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              x: isVisible ? 0 : (currentPhase === "erasing" && !isVisible ? 20 : -20),
            }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        )
      })}
    </h1>
  )
}

