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

    // Fetch reviews for this product
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
        },
        // Add a timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      })
    } catch (fetchError) {
      // Network error or timeout
      console.warn('Failed to fetch product reviews for rating:', fetchError)
      return NextResponse.json({ averageRating: 0, reviewCount: 0 })
    }

    if (!response.ok) {
      // If endpoint returns error, return 0
      console.warn(`Failed to fetch product reviews: ${response.status} ${response.statusText}`)
      return NextResponse.json({ averageRating: 0, reviewCount: 0 })
    }

    const reviews = await response.json()

    // Calculate average rating
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ averageRating: 0, reviewCount: 0 })
    }

    const validRatings = reviews
      .filter((review: any) => review.rating && review.rating > 0 && review.rating <= 5)
      .map((review: any) => review.rating)

    if (validRatings.length === 0) {
      return NextResponse.json({ averageRating: 0, reviewCount: 0 })
    }

    const sum = validRatings.reduce((acc: number, rating: number) => acc + rating, 0)
    const averageRating = sum / validRatings.length

    return NextResponse.json({ 
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: validRatings.length 
    })
  } catch (error) {
    console.error('Error calculating average rating:', error)
    // Return 0 on error to prevent breaking the page
    return NextResponse.json({ averageRating: 0, reviewCount: 0 })
  }
}

