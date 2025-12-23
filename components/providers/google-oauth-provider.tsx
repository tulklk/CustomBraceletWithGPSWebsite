"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"

interface GoogleOAuthProviderProps {
  children: React.ReactNode
}

export function GoogleOAuthProviderWrapper({ children }: GoogleOAuthProviderProps) {
  // Get Google Client ID from environment variable
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  if (!clientId) {
    // If no client ID, render children without provider
    // This allows the app to work without Google OAuth configured
    console.warn(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not be available."
    )
    return <>{children}</>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}

