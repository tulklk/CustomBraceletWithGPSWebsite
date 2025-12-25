import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://customerbraceletwithgpswebsite-backend.fly.dev"

/**
 * Proxy POST request to backend /api/guest/orders/apply-voucher
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/guest/orders/apply-voucher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
    })

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
    console.error("Voucher application proxy error:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to apply voucher. Please try again.",
        statusCode: 0,
      },
      { status: 500 }
    )
  }
}

