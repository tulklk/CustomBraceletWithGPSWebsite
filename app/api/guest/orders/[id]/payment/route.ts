import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://customerbraceletwithgpswebsite-backend.fly.dev"

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

    // ========== LOG PROXY REQUEST TO BACKEND ==========
    console.log("========== [API Route] PROXY PAYMENT REQUEST ==========")
    console.log("📍 Backend URL:", `${BACKEND_URL}/api/guest/orders/${orderId}/payment`)
    console.log("🔧 HTTP Method: POST")
    console.log("")
    console.log("📦 Request Details:")
    console.log("  - Order ID:", orderId)
    console.log("  - Provider:", body.provider)
    console.log("  - Return URL:", body.returnUrl)
    console.log("  - Cancel URL:", body.cancelUrl)
    console.log("")
    console.log("📤 Request Headers:")
    console.log("  - Content-Type: application/json")
    console.log("  - accept: application/json")
    console.log("")
    console.log("📋 Request Body (Full):")
    console.log(JSON.stringify(body, null, 2))
    console.log("")
    console.log("📋 Request Body (Stringified for fetch):")
    console.log(JSON.stringify(body))
    console.log("========================================================")

    const response = await fetch(`${BACKEND_URL}/api/guest/orders/${orderId}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("📥 [API Route] Backend response status:", response.status)
    console.log("📥 [API Route] Backend response headers:", Object.fromEntries(response.headers.entries()))

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
      console.log("✅ [API Route] Backend success response:")
      console.log(JSON.stringify(jsonData, null, 2))
      console.log("  - Payment URL:", jsonData.paymentUrl || jsonData.payment_url || jsonData.url || "NOT FOUND")
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

