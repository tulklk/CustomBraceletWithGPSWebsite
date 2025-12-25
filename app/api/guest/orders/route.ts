import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://customerbraceletwithgpswebsite-backend.fly.dev"

/**
 * Proxy POST request to backend /api/guest/orders
 * This helps bypass HTTP/2 protocol errors and CORS issues
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/guest/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
      // Force HTTP/1.1 by not specifying HTTP version
      // Next.js will handle this
    })

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || `HTTP error! status: ${response.status}` }
      }
      
      return NextResponse.json(errorData, { status: response.status })
    }

    // Try to parse JSON response
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json()
      return NextResponse.json(jsonData, { status: response.status })
    } else {
      const textData = await response.text()
      return NextResponse.json(
        { message: `Unexpected response format: ${textData.substring(0, 100)}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Guest order creation proxy error:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to create order. Please try again.",
        statusCode: 0,
      },
      { status: 500 }
    )
  }
}

