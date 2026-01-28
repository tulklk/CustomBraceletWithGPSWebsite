import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? "http://localhost:5037"
    : "https://customerbraceletwithgpswebsite-backend.fly.dev")

/**
 * Proxy GET request to backend /api/News/child-abduction
 * This helps bypass CORS issues when accessing from different browsers
 */
export async function GET(request: NextRequest) {
  // Allowance for self-signed certificates in development
  if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "6"

    const url = `${BACKEND_URL}/api/News/child-abduction?page=${page}&pageSize=${pageSize}`

    console.log("[Child Abduction News Proxy] Fetching from:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
    })

    console.log("[Child Abduction News Proxy] Response status:", response.status)

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || `HTTP error! status: ${response.status}` }
      }

      console.error("[Child Abduction News Proxy] Error response:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    // Try to parse JSON response
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json()
      console.log("[Child Abduction News Proxy] Success, articles count:", jsonData?.articles?.length || 0)
      return NextResponse.json(jsonData, { status: response.status })
    } else {
      const textData = await response.text()
      return NextResponse.json(
        { message: `Unexpected response format: ${textData.substring(0, 100)}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("[Child Abduction News Proxy] Proxy error:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to fetch child abduction news. Please try again.",
        statusCode: 0,
      },
      { status: 500 }
    )
  }
}
