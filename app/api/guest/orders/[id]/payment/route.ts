import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || ""

/**
 * Proxy POST request to backend /api/guest/orders/{id}/payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/guest/orders/${orderId}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [API Route] Backend error response:")
      console.error("  - Status:", response.status)
      console.error("  - Status Text:", response.statusText)
      console.error("  - Response Body:", errorText)
      let errorData: any
      try {
        errorData = JSON.parse(errorText)
        console.error("  - Parsed Error:", JSON.stringify(errorData, null, 2))
      } catch {
        errorData = { message: errorText || `HTTP error! status: ${response.status}` }
        console.error("  - Error (not JSON):", errorData)
      }
      return NextResponse.json(errorData, { status: response.status })
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json()
      return NextResponse.json(jsonData, { status: response.status })
    } else {
      const textData = await response.text()
      console.error("❌ [API Route] Unexpected response format (not JSON):")
      console.error("  - Content-Type:", contentType)
      console.error("  - Response Text (first 200 chars):", textData.substring(0, 200))
      return NextResponse.json(
        { message: `Unexpected response format: ${textData.substring(0, 100)}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Payment link creation proxy error:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      {
        message: error.message || "Failed to create payment link. Please try again.",
        statusCode: 0,
      },
      { status: 500 }
    )
  }
}

