import { NextRequest, NextResponse } from "next/server"

const PROVINCES_API_BASE = "https://provinces.open-api.vn/api/v2"

// Cache provinces data for 24 hours
export const revalidate = 86400 // 24 hours in seconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get("action")
  const code = searchParams.get("code")
  const depth = searchParams.get("depth") || "1"

  try {
    let url = ""

    switch (action) {
      case "provinces":
        // Get all provinces
        url = `${PROVINCES_API_BASE}/?depth=${depth}`
        break
      case "province":
        // Get province with districts
        if (!code) {
          return NextResponse.json({ error: "Code is required" }, { status: 400 })
        }
        url = `${PROVINCES_API_BASE}/p/${code}?depth=2`
        break
      case "districts":
        // Get districts by province code
        if (!code) {
          return NextResponse.json({ error: "Code is required" }, { status: 400 })
        }
        // Get all data with depth=2 to ensure we have districts
        url = `${PROVINCES_API_BASE}/?depth=2`
        break
      case "district":
        // Get district with wards
        if (!code) {
          return NextResponse.json({ error: "Code is required" }, { status: 400 })
        }
        url = `${PROVINCES_API_BASE}/d/${code}?depth=2`
        break
      case "wards":
        // Get wards by province code (skip district)
        if (!code) {
          return NextResponse.json({ error: "Code is required" }, { status: 400 })
        }
        // Try direct endpoint first: /p/{code}/w
        url = `${PROVINCES_API_BASE}/p/${code}/w`
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `API returned ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // For districts action, extract districts from province response
    if (action === "districts") {
      let districts: any[] = []

      // Response should be an array of all provinces with depth=2
      if (Array.isArray(data)) {
        const provinceCodeNum = parseInt(code || "0")
        const province = data.find((p: any) => {
          const pCode = typeof p.code === 'number' ? p.code : parseInt(p.code || "0")
          return pCode === provinceCodeNum ||
            p.code?.toString() === code ||
            parseInt(p.code?.toString() || "0") === provinceCodeNum
        }        )

        if (province) {
          // Try multiple possible property names for districts
          districts = province.districts || province.d || []

          // If no districts, check if we need to fetch them differently
          // Some API versions might require a separate call
          if (districts.length === 0) {
            // Try fetching districts directly using /p/{code}/d endpoint
            try {
              const districtsUrl = `${PROVINCES_API_BASE}/p/${code}/d`
              const districtsResponse = await fetch(districtsUrl, {
                headers: {
                  "Accept": "application/json",
                },
              })

              if (districtsResponse.ok) {
                const districtsData = await districtsResponse.json()

                // Handle different response formats
                if (Array.isArray(districtsData)) {
                  districts = districtsData
                } else if (districtsData.districts && Array.isArray(districtsData.districts)) {
                  districts = districtsData.districts
                } else if (districtsData.data && Array.isArray(districtsData.data)) {
                  districts = districtsData.data
                }
              }
            } catch (directError) {
              console.error("Direct districts fetch error:", directError)
            }
          }
        }
      } else {
        // Response is a single province object
        districts = data.districts || data.d || []
      }

      return NextResponse.json({
        districts: districts,
      })
    }

    // For wards action, handle both district code and province code
    if (action === "wards") {
      // If response is an array, it's likely wards directly
      if (Array.isArray(data)) {
        return NextResponse.json({
          wards: data,
        })
      }
      // If response is an object, extract wards
      return NextResponse.json({
        wards: data.wards || data.w || [],
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Provinces API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}

