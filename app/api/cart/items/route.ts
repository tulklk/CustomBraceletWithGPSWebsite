import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://customerbraceletwithgpswebsite-backend.fly.dev"

/**
 * Proxy POST request to backend /api/Cart/items (add item to cart)
 * This helps bypass HTTP/2 protocol errors and CORS issues
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("[Cart POST] Adding item to cart:", body)

    const response = await fetch(`${BACKEND_URL}/api/Cart/items`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[Cart POST] Response status:", response.status)

    // Read response body once
    const responseText = await response.text()
    let responseData: any

    if (!response.ok) {
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { message: responseText || `HTTP error! status: ${response.status}` }
      }
      
      console.error("[Cart POST] Error response:", responseData)
      return NextResponse.json(responseData, { status: response.status })
    }

    // Parse successful response
    try {
      responseData = JSON.parse(responseText)
      console.log("[Cart POST] Item added successfully:", responseData.id)
      return NextResponse.json(responseData, { status: response.status })
    } catch (parseError) {
      console.error("[Cart POST] Failed to parse JSON:", parseError)
      return NextResponse.json(
        { message: `Invalid JSON response: ${responseText.substring(0, 100)}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("[Cart POST] Proxy error:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to add item to cart. Please try again.",
        statusCode: 0,
      },
      { status: 500 }
    )
  }
}

