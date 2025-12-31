"use client"

import { useEffect } from "react"
import { initFacebookSDK } from "@/lib/facebook"

export function FacebookSDKProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Facebook SDK when app loads
    initFacebookSDK().catch((err) => {
      console.error("Facebook SDK initialization error:", err)
    })
  }, [])

  return <>{children}</>
}

