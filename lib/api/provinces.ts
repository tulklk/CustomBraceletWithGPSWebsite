// API for Vietnamese Provinces
// Using provinces.open-api.vn/api/v2/

export interface Province {
  code: string | number
  name: string
  nameEn?: string
  fullName?: string
  fullNameEn?: string
  codeName?: string
  codename?: string
  division_type?: string
  phone_code?: number
  administrativeUnit?: {
    id: number
    fullName: string
    fullNameEn: string
    shortName: string
    shortNameEn: string
    codeName: string
    codeNameEn: string
  }
  districts?: District[]
  d?: District[] // Alternative property name
}

export interface District {
  code: string | number
  name: string
  nameEn?: string
  fullName?: string
  fullNameEn?: string
  codeName?: string
  codename?: string
  provinceCode?: string | number
  province_code?: string | number
  administrativeUnit?: {
    id: number
    fullName: string
    fullNameEn: string
    shortName: string
    shortNameEn: string
    codeName: string
    codeNameEn: string
  }
  wards?: Ward[]
  w?: Ward[] // Alternative property name
}

export interface Ward {
  code: string | number
  name: string
  nameEn?: string
  fullName?: string
  fullNameEn?: string
  codeName?: string
  codename?: string
  districtCode?: string | number
  district_code?: string | number
  administrativeUnit?: {
    id: number
    fullName: string
    fullNameEn: string
    shortName: string
    shortNameEn: string
    codeName: string
    codeNameEn: string
  }
}

const PROVINCES_API_BASE = "https://provinces.open-api.vn/api/v2"
const PROXY_API_BASE = "/api/provinces"

export const provincesApi = {
  /**
   * Get all provinces (depth=1)
   */
  async getProvinces(): Promise<Province[]> {
    try {
      // Use proxy API to avoid CORS
      const response = await fetch(`${PROXY_API_BASE}?action=provinces&depth=1`)
      if (!response.ok) {
        throw new Error("Failed to fetch provinces")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching provinces:", error)
      throw error
    }
  },

  /**
   * Get province by code with districts (depth=2)
   */
  async getProvinceWithDistricts(provinceCode: string): Promise<Province> {
    try {
      // Use proxy API to avoid CORS
      const response = await fetch(`${PROXY_API_BASE}?action=province&code=${provinceCode}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch province with districts: ${response.status}`)
      }
      const data = await response.json()
      console.log("Province with districts response:", data)
      
      return data
    } catch (error) {
      console.error("Error fetching province with districts:", error)
      throw error
    }
  },

  /**
   * Get district by code with wards (depth=2)
   */
  async getDistrictWithWards(districtCode: string): Promise<District> {
    try {
      // Use proxy API to avoid CORS
      const response = await fetch(`${PROXY_API_BASE}?action=district&code=${districtCode}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch district with wards: ${response.status}`)
      }
      const data = await response.json()
      console.log("District with wards response:", data)
      return data
    } catch (error) {
      console.error("Error fetching district with wards:", error)
      throw error
    }
  },

  /**
   * Get districts by province code
   */
  async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
    try {
      console.log("Fetching districts for province code:", provinceCode)
      
      // First, try to get province with depth=2 which should include districts
      try {
        const provinceResponse = await fetch(`${PROXY_API_BASE}?action=province&code=${provinceCode}`)
        if (provinceResponse.ok) {
          const provinceData = await provinceResponse.json()
          console.log("Province data structure:", {
            keys: Object.keys(provinceData),
            hasDistricts: !!provinceData.districts,
            hasD: !!provinceData.d,
            districtsLength: provinceData.districts?.length || 0,
            dLength: provinceData.d?.length || 0,
          })
          
          // Try multiple property names
          let districts = provinceData.districts || provinceData.d || []
          
          // If still empty, check if response structure is different
          if (districts.length === 0) {
            // Log full structure for debugging
            console.log("Full province data:", JSON.stringify(provinceData).substring(0, 1000))
            
            // Some APIs might nest districts differently
            if (provinceData.data && provinceData.data.districts) {
              districts = provinceData.data.districts
            }
            
            // API v2 might return wards directly instead of districts
            // Check if wards exist and have province_code matching
            if (districts.length === 0 && provinceData.wards && Array.isArray(provinceData.wards)) {
              console.log("Found wards in province, checking if they are districts...")
              // If wards have province_code, they might actually be districts
              // But typically, we need to fetch districts separately
              // Let's try to get districts from a different endpoint
            }
          }
          
          if (districts.length > 0) {
            console.log("Found districts from province:", districts.length)
            return districts
          }
        }
      } catch (provinceError) {
        console.error("Province fetch failed:", provinceError)
      }
      
      // Fallback: try direct districts endpoint
      console.log("Trying direct districts endpoint...")
      const response = await fetch(`${PROXY_API_BASE}?action=districts&code=${provinceCode}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch districts: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Districts response:", data)
      
      // Extract districts from response
      let districts = data.districts || []
      
      console.log("Final districts count:", districts.length)
      return districts
    } catch (error) {
      console.error("Error fetching districts:", error)
      return []
    }
  },

  /**
   * Get wards by district code
   */
  async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
    try {
      console.log("Fetching wards for district code:", districtCode)
      
      // Use proxy API to avoid CORS
      const response = await fetch(`${PROXY_API_BASE}?action=wards&code=${districtCode}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wards: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Wards response:", data)
      
      // Extract wards from response
      let wards = data.wards || []
      
      // If no wards in response, try getting district with depth=2
      if (wards.length === 0) {
        console.log("No wards in response, trying district endpoint...")
        try {
          const districtResponse = await fetch(`${PROXY_API_BASE}?action=district&code=${districtCode}`)
          if (districtResponse.ok) {
            const districtData = await districtResponse.json()
            console.log("District data:", districtData)
            wards = districtData.wards || districtData.w || []
            console.log("Wards from district:", wards.length)
          }
        } catch (districtError) {
          console.error("District fetch failed:", districtError)
        }
      }
      
      console.log("Final wards count:", wards.length)
      return wards
    } catch (error) {
      console.error("Error fetching wards:", error)
      return []
    }
  },

  /**
   * Get wards directly by province code (for when district layer is skipped)
   */
  async getWardsByProvince(provinceCode: string): Promise<Ward[]> {
    try {
      console.log("Fetching wards for province code:", provinceCode)
      
      // Get province with depth=2 to get all wards
      const province = await this.getProvinceWithDistricts(provinceCode)
      console.log("Province data for wards:", province)
      
      // Extract wards from province (API v2 might return wards directly)
      let wards = province.wards || []
      
      // If no wards in province, try to get from districts
      if (wards.length === 0 && province.districts && province.districts.length > 0) {
        console.log("No wards in province, collecting from districts...")
        // Collect all wards from all districts
        const allWards: Ward[] = []
        for (const district of province.districts) {
          if (district.wards && district.wards.length > 0) {
            allWards.push(...district.wards)
          } else if (district.w && district.w.length > 0) {
            allWards.push(...district.w)
          }
        }
        wards = allWards
        console.log(`Collected ${wards.length} wards from ${province.districts.length} districts`)
      }
      
      console.log("Final wards count from province:", wards.length)
      return wards
    } catch (error) {
      console.error("Error fetching wards by province:", error)
      return []
    }
  },
}

