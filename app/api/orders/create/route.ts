import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || ""

/**
 * Proxy POST request to backend /api/Orders (create order for authenticated users)
 * This helps bypass HTTP/2 protocol errors and CORS issues
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader) {
      console.error("Order creation proxy: Missing authorization header")
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch (parseError: any) {
      console.error("Order creation proxy: Failed to parse request body:", parseError)
      return NextResponse.json(
        { message: "Invalid request body", statusCode: 400 },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/Orders`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Read response body once
    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")
    
    let responseData: any
    let responseText: string = ""
    
    try {
      if (isJson) {
        responseData = await response.json()
      } else {
        responseText = await response.text()
      }
    } catch (readError: any) {
      console.error("Order creation proxy: Failed to read response:", readError)
      return NextResponse.json(
        { message: "Failed to read response from backend", statusCode: 500 },
        { status: 500 }
      )
    }

    if (!response.ok) {
      console.error("Order creation proxy: Backend error response:", isJson ? responseData : responseText)
      
      if (isJson) {
        return NextResponse.json(responseData || { message: `HTTP error! status: ${response.status}` }, { status: response.status })
      } else {
        return NextResponse.json(
          { message: responseText || `HTTP error! status: ${response.status}`, statusCode: response.status },
          { status: response.status }
        )
      }
    }

    // Success response
    if (isJson) {
      return NextResponse.json(responseData, { status: response.status })
    } else {
      console.error("Order creation proxy: Unexpected response format (not JSON):", responseText.substring(0, 200))
      return NextResponse.json(
        { message: `Unexpected response format: ${responseText.substring(0, 100)}`, statusCode: 500 },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Order creation proxy error:", error)
    console.error("Order creation proxy error stack:", error.stack)
    return NextResponse.json(
      {
        message: error.message || "Failed to create order. Please try again.",
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}

