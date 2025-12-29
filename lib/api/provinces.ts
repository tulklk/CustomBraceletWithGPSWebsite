// API for Vietnamese Provinces
// Using provinces.open-api.vn/api/v2/

import { cachedFetch, cacheConfigs } from "@/lib/cache"

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
  wards?: Ward[] // Wards can be directly in province (when depth=2 or depth=3)
  w?: Ward[] // Alternative property name for wards
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
   * Get all provinces (depth=1) - with caching
   */
  async getProvinces(): Promise<Province[]> {
    try {
      // Use proxy API to avoid CORS with caching
      return await cachedFetch<Province[]>(
        `${PROXY_API_BASE}?action=provinces&depth=1`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.provinces,
          storageKey: "provinces_list",
        }
      )
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
      return await cachedFetch<Province>(
        `${PROXY_API_BASE}?action=province&code=${provinceCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.provinces,
          storageKey: `province_${provinceCode}`,
        }
      )
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
      return await cachedFetch<District>(
        `${PROXY_API_BASE}?action=district&code=${districtCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.districts,
          storageKey: `district_${districtCode}`,
        }
      )
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
        const provinceData = await cachedFetch<any>(
          `${PROXY_API_BASE}?action=province&code=${provinceCode}`,
          {
            method: "GET",
          },
          {
            ...cacheConfigs.provinces,
            storageKey: `province_${provinceCode}`,
          }
        )
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
      } catch (provinceError) {
        console.error("Province fetch failed:", provinceError)
      }
      
      // Fallback: try direct districts endpoint
      console.log("Trying direct districts endpoint...")
      const data = await cachedFetch<any>(
        `${PROXY_API_BASE}?action=districts&code=${provinceCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.districts,
          storageKey: `districts_${provinceCode}`,
        }
      )
      
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
      const data = await cachedFetch<any>(
        `${PROXY_API_BASE}?action=wards&code=${districtCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.wards,
          storageKey: `wards_${districtCode}`,
        }
      )
      
      console.log("Wards response:", data)
      
      // Extract wards from response
      let wards = data.wards || []
      
      // If no wards in response, try getting district with depth=2
      if (wards.length === 0) {
        console.log("No wards in response, trying district endpoint...")
        try {
          try {
            const districtData = await cachedFetch<any>(
              `${PROXY_API_BASE}?action=district&code=${districtCode}`,
              {
                method: "GET",
              },
              {
                ...cacheConfigs.districts,
                storageKey: `district_${districtCode}`,
              }
            )
            console.log("District data:", districtData)
            wards = districtData.wards || districtData.w || []
            console.log("Wards from district:", wards.length)
          } catch (districtError) {
            console.error("District fetch failed:", districtError)
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
   * Get wards directly by province code (skip district layer)
   * Uses provinces.open-api.vn API to get all wards for a province
   */
  async getWardsByProvince(provinceCode: string): Promise<Ward[]> {
    try {
      console.log("Fetching wards for province code:", provinceCode)
      
      const allWards: Ward[] = []
      const seenWardCodes = new Set<string | number>()
      
      // Helper function to add wards without duplicates
      const addWards = (wards: any[]) => {
        if (!wards || !Array.isArray(wards)) return
        for (const ward of wards) {
          const wardCode = ward.code || ward.codename
          if (wardCode && !seenWardCodes.has(wardCode)) {
            seenWardCodes.add(wardCode)
            allWards.push(ward)
          }
        }
      }
      
      // Method 1: Get province with depth=2 or depth=3 - check if province has wards directly
      try {
        console.log("Trying to get province with wards...")
        const province = await this.getProvinceWithDistricts(provinceCode)
        console.log("Province data:", province)
        
        // FIRST: Check if province has wards directly (some API responses include wards at province level)
        if (province.wards && Array.isArray(province.wards) && province.wards.length > 0) {
          console.log(`Found ${province.wards.length} wards directly in province object`)
          addWards(province.wards)
        } else if (province.w && Array.isArray(province.w) && province.w.length > 0) {
          console.log(`Found ${province.w.length} wards directly in province object (w property)`)
          addWards(province.w)
        }
        
        // SECOND: If no direct wards, collect from districts
        if (allWards.length === 0) {
          console.log("No direct wards, collecting from districts...")
          const districts = province.districts || province.d || []
          for (const district of districts) {
            const districtWards = district.wards || district.w || []
            addWards(districtWards)
          }
          console.log(`Collected ${allWards.length} wards from districts`)
        }
      } catch (provinceError) {
        console.warn("Province method failed:", provinceError)
      }
      
      // Method 2: Try to get all provinces with depth=3 and filter
      if (allWards.length === 0) {
        try {
          console.log("Trying to get all wards with depth=3...")
          const response = await fetch(`${PROXY_API_BASE}?action=provinces&depth=3`)
          if (response.ok) {
            const allProvinces = await response.json()
            const provinceCodeNum = typeof provinceCode === 'string' ? parseInt(provinceCode) : provinceCode
            
            // Find the province and collect all its wards
            for (const province of allProvinces) {
              const pCode = typeof province.code === 'number' ? province.code : parseInt(province.code || "0")
              if (pCode === provinceCodeNum || province.code?.toString() === provinceCode) {
                console.log(`Found province ${province.name}, collecting wards...`)
                
                // Check direct wards first
                if (province.wards && Array.isArray(province.wards)) {
                  addWards(province.wards)
                  console.log(`Collected ${province.wards.length} wards directly from province`)
                } else if (province.w && Array.isArray(province.w)) {
                  addWards(province.w)
                  console.log(`Collected ${province.w.length} wards directly from province (w property)`)
                }
                
                // Then collect from districts if needed
                if (allWards.length === 0) {
                  const districts = province.districts || province.d || []
                  for (const district of districts) {
                    const districtWards = district.wards || district.w || []
                    addWards(districtWards)
                  }
                }
                
                console.log(`Collected ${allWards.length} wards from province data`)
                break
              }
            }
          }
        } catch (depth3Error) {
          console.warn("Depth=3 method failed:", depth3Error)
        }
      }
      
      // Method 3: Try direct API endpoint /p/{code}/w (if available)
      if (allWards.length === 0) {
        try {
          console.log("Trying direct wards endpoint /p/{code}/w...")
          const directUrl = `https://provinces.open-api.vn/api/v2/p/${provinceCode}/w`
          const directResponse = await fetch(directUrl, {
            headers: {
              "Accept": "application/json",
            },
          })
          
          if (directResponse.ok) {
            const directData = await directResponse.json()
            // Response might be an array of wards or an object with wards property
            if (Array.isArray(directData)) {
              addWards(directData)
              console.log(`Got ${directData.length} wards from direct endpoint (array)`)
            } else if (directData.wards && Array.isArray(directData.wards)) {
              addWards(directData.wards)
              console.log(`Got ${directData.wards.length} wards from direct endpoint (object)`)
            } else if (directData.w && Array.isArray(directData.w)) {
              addWards(directData.w)
              console.log(`Got ${directData.w.length} wards from direct endpoint (w property)`)
            }
          }
        } catch (directError) {
          console.warn("Direct wards endpoint failed:", directError)
        }
      }
      
      console.log(`Final wards count for province ${provinceCode}: ${allWards.length}`)
      return allWards
    } catch (error) {
      console.error("Error fetching wards by province:", error)
      return []
    }
  },
}

