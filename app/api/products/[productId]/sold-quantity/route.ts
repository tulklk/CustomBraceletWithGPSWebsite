import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Fetch product statistics from backend API
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}/api/Products/${productId}/statistics`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
        },
        // Add a timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      })
    } catch (fetchError) {
      // Network error or timeout
      console.warn('Failed to fetch product statistics:', fetchError)
      return NextResponse.json({ soldQuantity: 0 })
    }

    if (!response.ok) {
      // If endpoint returns error, return 0
      console.warn(`Failed to fetch product statistics: ${response.status} ${response.statusText}`)
      return NextResponse.json({ soldQuantity: 0 })
    }

    const statistics = await response.json()

    // Extract sold quantity from statistics response
    // The response might have different field names, so we'll check common ones
    const soldQuantity = 
      statistics.soldQuantity ?? 
      statistics.totalSold ?? 
      statistics.soldCount ?? 
      statistics.quantitySold ?? 
      0

    return NextResponse.json({ soldQuantity })
  } catch (error) {
    console.error('Error fetching sold quantity:', error)
    // Return 0 on error to prevent breaking the page
    return NextResponse.json({ soldQuantity: 0 })
  }
}

