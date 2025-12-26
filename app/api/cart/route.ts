import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://customerbraceletwithgpswebsite-backend.fly.dev"

/**
 * Proxy GET request to backend /api/Cart (get cart)
 * Proxy DELETE request to backend /api/Cart (clear cart)
 * This helps bypass HTTP/2 protocol errors and CORS issues
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      )
    }

    console.log("[Cart GET] Fetching cart from backend...")
    const response = await fetch(`${BACKEND_URL}/api/Cart`, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
    })

    console.log("[Cart GET] Response status:", response.status)

    // Read response body once
    const responseText = await response.text()
    let responseData: any

    if (!response.ok) {
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { message: responseText || `HTTP error! status: ${response.status}` }
      }
      
      console.error("[Cart GET] Error response:", responseData)
      return NextResponse.json(responseData, { status: response.status })
    }

    // Parse successful response
    try {
      responseData = JSON.parse(responseText)
      console.log("[Cart GET] Success, cart items count:", responseData?.items?.length || 0)
      return NextResponse.json(responseData, { status: response.status })
    } catch (parseError) {
      console.error("[Cart GET] Failed to parse JSON:", parseError)
      return NextResponse.json(
        { message: `Invalid JSON response: ${responseText.substring(0, 100)}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("[Cart GET] Proxy error:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to fetch cart. Please try again.",
        statusCode: 0,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      )
    }

    console.log("[Cart DELETE] Clearing cart from backend...")
    const response = await fetch(`${BACKEND_URL}/api/Cart`, {
      method: "DELETE",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
    })

    console.log("[Cart DELETE] Response status:", response.status)

    // Read response body once
    const responseText = await response.text()

    if (!response.ok) {
      let errorData: any
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText || `HTTP error! status: ${response.status}` }
      }
      
      console.error("[Cart DELETE] Error response:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    // DELETE might return empty body (204 No Content or 200 OK)
    if (response.status === 204 || response.status === 200) {
      console.log("[Cart DELETE] Cart cleared successfully")
      return new NextResponse(null, { status: response.status })
    }

    // If there's a response body, try to parse it
    if (responseText) {
      try {
        const jsonData = JSON.parse(responseText)
        return NextResponse.json(jsonData, { status: response.status })
      } catch {
        // If not JSON, return empty response
        return new NextResponse(null, { status: response.status })
      }
    }

    return new NextResponse(null, { status: response.status })
  } catch (error: any) {
    console.error("[Cart DELETE] Proxy error:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to clear cart. Please try again.",
        statusCode: 0,
      },
      { status: 500 }
    )
  }
}

